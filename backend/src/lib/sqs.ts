import * as t from "io-ts";
import {
  MessageList,
  ChangeMessageVisibilityBatchRequestEntry,
  ChangeMessageVisibilityBatchRequest,
  DeleteMessageBatchRequestEntry,
} from "aws-sdk/clients/sqs";
import { left, right, Either, isLeft } from "fp-ts/lib/Either";
import { decode } from "./iots";
import AWS from "aws-sdk";
import { v4 as uuid } from "uuid";

export const getClient = () => {
  return new AWS.SQS();
};

export const getQueueUrlFromName = async (
  client: AWS.SQS,
  name: string
): Promise<Either<"ERROR", string>> => {
  try {
    const result = await client.getQueueUrl({ QueueName: name }).promise();

    if (result.QueueUrl == null) {
      console.error("sqs/getQueueUrlFromName: url not found");
      return left("ERROR");
    }

    return right(result.QueueUrl);
  } catch (error) {
    console.error(`sqs/getQueueUrlFromName: could not find queue (${name})`, {
      error: error.stack,
    });
    return left("ERROR");
  }
};

export const sendMessage = async (
  client: AWS.SQS,
  request: AWS.SQS.SendMessageRequest
): Promise<Either<"ERROR", string>> => {
  const result = await client.sendMessage(request).promise();

  if (result.MessageId == null) {
    console.error("sqs/sendMessage failed", { error: JSON.stringify(result) });
    return left("ERROR");
  }

  return right(result.MessageId);
};

export const sendMessages = async (
  client: AWS.SQS,
  queueUrl: string,
  messages: MessageList
): Promise<Either<"ERROR", AWS.SQS.SendMessageBatchResult>> => {
  const entries: AWS.SQS.SendMessageBatchRequestEntryList = messages.map(
    (message: AWS.SQS.Message) => {
      const retries = message.MessageAttributes?.retries?.StringValue ?? "0";

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
    return right(
      await client
        .sendMessageBatch({ QueueUrl: queueUrl, Entries: entries })
        .promise()
    );
  } catch (error) {
    console.error("sqs/sendMessageBatch failed", { error: error.stack });
    return left("ERROR");
  }
};

export const getMessages = async (
  client: AWS.SQS,
  queueUrl: string
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
    console.error("sqs/getMessages failed", { error: error.stack });
    return left("ERROR");
  }
};

export const getApproximateNumberOfMessages = async (
  client: AWS.SQS,
  queueUrl: string
): Promise<Either<"ERROR", number>> => {
  const result = await client
    .getQueueAttributes({
      QueueUrl: queueUrl,
      AttributeNames: ["ApproximateNumberOfMessage"],
    })
    .promise();

  if (!result.Attributes) {
    console.error("sqs/getApproximateNumberOfMessages failed", {
      error: "result.Attributes === undefined",
    });
    return left("ERROR");
  }

  if (result.Attributes.ApproximateNumberOfMessages === undefined) {
    console.error("sqs/getApproximateNumberOfMessages failed", {
      error: "result.Attributes.ApproximateNumberOfMessages === undefined",
    });
    return left("ERROR");
  }

  const decodeResult = decode(
    t.number,
    result.Attributes.ApproximateNumberOfMessages
  );

  if (isLeft(decodeResult)) {
    console.error("sqs/getApproximateNumberOfMessages failed", {
      error: decodeResult.left,
    });
    return left("ERROR");
  }

  return right(decodeResult.right);
};

export const deleteMessages = async (
  client: AWS.SQS,
  queueUrl: string,
  messages: MessageList
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
    console.error("sqs/deleteMessages failed", { error: error.stack });
    return left("ERROR");
  }
};

export const hideMessages = async (
  client: AWS.SQS,
  queueUrl: string,
  messages: MessageList,
  seconds: number
): Promise<void> => {
  const entries = messages.map(
    (m): ChangeMessageVisibilityBatchRequestEntry => {
      return {
        Id: m.MessageId as string,
        ReceiptHandle: m.ReceiptHandle as string,
        VisibilityTimeout: seconds,
      };
    }
  );

  const request: ChangeMessageVisibilityBatchRequest = {
    QueueUrl: queueUrl,
    Entries: entries,
  };

  // TODO: parse results, some messages can fail and some can succeed, return this
  await client.changeMessageVisibilityBatch(request).promise();
};
