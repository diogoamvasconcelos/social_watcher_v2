import { APIGatewayProxyEvent } from "aws-lambda";
import { isLeft, left, right } from "fp-ts/lib/Either";
import { getConfig } from "@src/lib/config";
import { getLogger } from "@src/lib/logger";
import { apigwMiddlewareStack } from "@src/handlers/middlewares/apigwMiddleware";
import {
  CreatePaymentsPortalErrorCode,
  CreatePaymentsPortalResponse,
  createPaymentsPortalUserDataCodec,
} from "./models/createPaymentsPortal";
import { ApiResponse } from "./models/models";
import { toRequestWithUserData } from "./shared";
import { getClient as getPaymentsClient } from "@src/lib/stripe/client";
import { getClient as getSsmClient } from "@src/lib/ssm";
import { getClientCredentials as getPaymentsCredentials } from "@src/adapters/paymentsManager/client";
import { makeCreatePaymentsPortalSession } from "@src/adapters/paymentsManager/createPaymentsPortalSession";
import { getClient as getUsersStoreClient } from "@src/adapters/userStore/client";
import { makeGetPaymentData } from "@src/adapters/userStore/getPaymentData";
import { makeInternalErrorResponse, makeSuccessResponse } from "./responses";

// * Customize the portal here: https://dashboard.stripe.com/test/settings/billing/portal
// * Don't forget that you need to add the products so users can update their plans

const handler = async (
  event: APIGatewayProxyEvent
): Promise<
  ApiResponse<CreatePaymentsPortalErrorCode, CreatePaymentsPortalResponse>
> => {
  const config = getConfig();
  const logger = getLogger();

  const userStoreClient = getUsersStoreClient();
  const paymentsCredentials = await getPaymentsCredentials(
    getSsmClient(),
    logger
  );
  const paymentsClient = getPaymentsClient(paymentsCredentials);

  const getPaymentDataFn = makeGetPaymentData(
    userStoreClient,
    config.usersTableName
  );
  const createPaymentsPortalSessionFn =
    makeCreatePaymentsPortalSession(paymentsClient);

  const requestEither = toRequestWithUserData(
    logger,
    event,
    createPaymentsPortalUserDataCodec
  );
  if (isLeft(requestEither)) {
    return requestEither;
  }
  const request = requestEither.right;

  const paymentDataEither = await getPaymentDataFn(logger, request.authData.id);
  if (isLeft(paymentDataEither)) {
    return left(
      makeInternalErrorResponse("Failed to get payment data from user")
    );
  }
  if (paymentDataEither.right === "NOT_FOUND") {
    return left(makeInternalErrorResponse("User's payment data was not found"));
  }
  const paymentData = paymentDataEither.right;

  const sessionUrlEither = await createPaymentsPortalSessionFn(
    logger,
    paymentData.stripe.customerId,
    request.returnUrl
  );
  if (isLeft(sessionUrlEither)) {
    return left(
      makeInternalErrorResponse("Failed to create a payment portal session")
    );
  }

  return right(
    makeSuccessResponse(200, { sessionUrl: sessionUrlEither.right })
  );
};

export const lambdaHandler = apigwMiddlewareStack(handler);
