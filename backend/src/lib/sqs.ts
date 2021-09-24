import * as t from "io-ts";
import _ from "lodash";
import SQS, {
  MessageList,
  DeleteMessageBatchRequestEntry,
} from "aws-sdk/clients/sqs";
import { left, right, Either, isLeft } from "fp-ts/lib/Either";
import { Logger } from "./logger";
import { uuid } from "./uuid";
import { decode } from "@diogovasconcelos/lib/iots";

export const getClient = () => {
  return new SQS();
};
export type Client = ReturnType<typeof getClient>;

export const getQueueUrlFromName = async (
  client: Client,
  name: string,
  logger: Logger
): Promise<Either<"ERROR", string>> => {
  try {
    const result = await client.getQueueUrl({ QueueName: name }).promise();

    if (result.QueueUrl == null) {
      logger.error("sqs/getQueueUrlFromName: url not found");
      return left("ERROR");
    }

    return right(result.QueueUrl);
  } catch (error) {
    logger.error(`sqs/getQueueUrlFromName: could not find queue (${name})`, {
      error: JSON.stringify(error),
    });
    return left("ERROR");
  }
};

export const sendMessage = async (
  client: Client,
  request: AWS.SQS.SendMessageRequest,
  logger: Logger
): Promise<Either<"ERROR", string>> => {
  const result = await client.sendMessage(request).promise();

  if (result.MessageId == null) {
    logger.error("sqs/sendMessage failed", { error: JSON.stringify(result) });
    return left("ERROR");
  }

  return right(result.MessageId);
};

export const sendMessages = async (
  client: Client,
  queueUrl: string,
  messages: MessageList,
  logger: Logger
): Promise<Either<"ERROR", AWS.SQS.SendMessageBatchResult>> => {
  const entries: AWS.SQS.SendMessageBatchRequestEntryList = messages.map(
    (message: AWS.SQS.Message) => {
      const retries = message.MessageAttributes?.retries.StringValue ?? "0";

      return {
        Id: message.MessageId ?? uuid(),
        MessageBody: message.Body ?? "",
        MessageAttributes: {
          retries: {
            DataType: "Number",
            StringValue: (parseInt(retries) + 1).toString(),
          },
        },
      };
    }
  );

  try {
    // sendMessageBatch has a limit of 10 messages
    const batches = _.chunk(entries, 10);
    const batchesResult = await Promise.all(
      batches.map(async (batch) => {
        return await client
          .sendMessageBatch({ QueueUrl: queueUrl, Entries: batch })
          .promise();
      })
    );

    const result: AWS.SQS.SendMessageBatchResult = batchesResult.reduce(
      (acc, batchResult) => {
        acc.Successful = acc.Successful.concat(batchResult.Successful);
        acc.Failed = acc.Failed.concat(batchResult.Failed);
        return acc;
      }
    );

    return right(result);
  } catch (error) {
    logger.error("sqs/sendMessageBatch failed", {
      messages,
      queueUrl,
      error,
    });
    return left("ERROR");
  }
};

export const getMessages = async (
  client: Client,
  queueUrl: string,
  logger: Logger
): Promise<Either<"ERROR", MessageList>> => {
  try {
    const result = await client
      .receiveMessage({
        QueueUrl: queueUrl,
        MaxNumberOfMessages: 10,
        VisibilityTimeout: 60,
        WaitTimeSeconds: 2,
      })
      .promise();

    return right(result.Messages ?? []);
  } catch (error) {
    logger.error("sqs/getMessages failed", { error });
    return left("ERROR");
  }
};

export const getApproximateNumberOfMessages = async (
  client: Client,
  queueUrl: string,
  logger: Logger
): Promise<Either<"ERROR", number>> => {
  const result = await client
    .getQueueAttributes({
      QueueUrl: queueUrl,
      AttributeNames: ["ApproximateNumberOfMessage"],
    })
    .promise();

  if (!result.Attributes) {
    logger.error("sqs/getApproximateNumberOfMessages failed", {
      error: "result.Attributes === undefined",
    });
    return left("ERROR");
  }

  const decodeResult = decode(
    t.number,
    result.Attributes.ApproximateNumberOfMessages
  );

  if (isLeft(decodeResult)) {
    logger.error("sqs/getApproximateNumberOfMessages failed", {
      error: decodeResult.left,
    });
    return left("ERROR");
  }

  return right(decodeResult.right);
};

export const deleteMessages = async (
  client: Client,
  queueUrl: string,
  messages: MessageList,
  logger: Logger
): Promise<Either<"ERROR", AWS.SQS.DeleteMessageBatchResult>> => {
  const entries = messages.map((m) => {
    return {
      Id: m.MessageId,
      ReceiptHandle: m.ReceiptHandle,
    } as DeleteMessageBatchRequestEntry;
  });

  try {
    const result = await client
      .deleteMessageBatch({
        QueueUrl: queueUrl,
        Entries: entries,
      })
      .promise();

    return right(result);
  } catch (error) {
    logger.error("sqs/deleteMessages failed", { error: error });
    return left("ERROR");
  }
};
