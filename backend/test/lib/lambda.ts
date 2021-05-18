import * as aws from "aws-sdk";
import util from "util";
import { JsonEncodable } from "@shared/lib/src/models/jsonEncodable";
import { PromiseResult } from "aws-sdk/lib/request";
import { right, left } from "fp-ts/lib/Either";

const lambdaClient = new aws.Lambda();

export const invokeLambda = async (
  functionName: string,
  payload: JsonEncodable
) => {
  const params = {
    FunctionName: functionName,
    Payload: JSON.stringify(payload),
  };

  let result: PromiseResult<aws.Lambda.InvocationResponse, aws.AWSError>;
  try {
    result = await lambdaClient.invoke(params).promise();
  } catch (e) {
    return left(`Failed to invoke lambda function:\n${e}`);
  }

  if (result.StatusCode !== 200 || result.FunctionError != null) {
    return left(
      `Invocation of lambda function failed!\n${util.inspect(result)}`
    );
  }

  return right(result);
};
