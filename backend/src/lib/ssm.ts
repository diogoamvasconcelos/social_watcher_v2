import AWS from "aws-sdk";
import { Either, left, right } from "fp-ts/lib/Either";
import { applyTransformToItem } from "./iots";

export const getClient = () => {
  return new AWS.SSM();
};
export type Client = ReturnType<typeof getClient>;

export const getParameter = async <T>(
  client: AWS.SSM,
  request: AWS.SSM.GetParameterRequest,
  transformFn: (item: string) => Either<string[], T>
): Promise<Either<"ERROR", "NOT_FOUND" | T>> => {
  try {
    const getResult = await client.getParameter(request).promise();
    if (getResult.Parameter?.Value == null) {
      return right("NOT_FOUND");
    }

    return applyTransformToItem(transformFn, getResult.Parameter.Value);
  } catch (error) {
    if (error.statusCode == 400) {
      return right("NOT_FOUND");
    } else {
      console.error("Call to SSM get exited with following error");
      console.error(error);
      return left("ERROR");
    }
  }
};
