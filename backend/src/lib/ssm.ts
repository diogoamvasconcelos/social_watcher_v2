import SSM from "aws-sdk/clients/ssm";
import { Either, left, right } from "fp-ts/lib/Either";
import { applyTransformToItem } from "./iots";
import { Logger } from "./logger";

export const getClient = () => {
  return new SSM();
};
export type Client = ReturnType<typeof getClient>;

export const getParameter = async <T>(
  client: SSM,
  request: SSM.GetParameterRequest,
  transformFn: (item: string) => Either<string[], T>,
  logger: Logger
): Promise<Either<"ERROR", "NOT_FOUND" | T>> => {
  try {
    const getResult = await client.getParameter(request).promise();
    if (getResult.Parameter?.Value == null) {
      return right("NOT_FOUND");
    }

    return applyTransformToItem(transformFn, getResult.Parameter.Value, logger);
  } catch (error) {
    if (error.statusCode == 400) {
      return right("NOT_FOUND");
    } else {
      logger.error("Call to SSM get exited with error", { error });
      return left("ERROR");
    }
  }
};
