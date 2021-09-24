import SES from "aws-sdk/clients/ses";
import { right, left, Either } from "fp-ts/lib/Either";
import { Logger } from "./logger";

export const getClient = () => {
  return new SES();
};
export type Client = ReturnType<typeof getClient>;

type SESDependencies = {
  client: Client;
  logger: Logger;
};

// ++++++++++++++
// + SEND EMAIL +
// ++++++++++++++

export const sendEmail = async (
  { client, logger }: SESDependencies,
  params: SES.Types.SendEmailRequest
): Promise<Either<"ERROR", SES.SendEmailResponse>> => {
  try {
    const res = await client.sendEmail(params).promise();
    return right(res);
  } catch (error) {
    logger.error("SES sendEmail failed", {
      error,
      params: params,
    });
    return left("ERROR");
  }
};
