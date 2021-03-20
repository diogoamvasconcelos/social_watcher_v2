import {
  sendMessage,
  sendMessages,
  getMessages,
  getQueueUrlFromName,
  deleteMessages,
} from "./sqs";
import * as AWS from "aws-sdk";
import { getLogger } from "../../test/lib/mocks";
import { left, right } from "fp-ts/lib/Either";

jest.mock("aws-sdk", () => {
  return {
    SQS: jest.fn(() => {
      return {
        sendMessage: jest.fn().mockReturnThis(),
        sendMessageBatch: jest.fn().mockReturnThis(),
        receiveMessage: jest.fn().mockReturnThis(),
        getQueueUrl: jest.fn().mockReturnThis(),
        deleteMessageBatch: jest.fn().mockReturnThis(),
        promise: jest.fn(),
      };
    }),
  };
});

const client = new AWS.SQS();
let logger = getLogger();

const messages = [{ MessageId: "test", MessageBody: "hello world" }];
const result = { result: "not an error!" };

const sendMessageRequest = {
  MessageBody: "hello world",
  QueueUrl: "abc",
  MessageAttributes: {
    retries: {
      DataType: "Number",
      StringValue: "0",
    },
  },
};

describe("sendMessage", () => {
  beforeEach(() => {
    (client.sendMessage().promise as jest.MockedFunction<any>).mockReset();
    logger = getLogger();
  });

  it("throws when result.MessageID is empty", async () => {
    (client.sendMessage().promise as jest.MockedFunction<
      any
    >).mockReturnValueOnce({});

    expect(await sendMessage(client, sendMessageRequest, logger)).toEqual(
      left("ERROR")
    );
  });

  it("succeeds when result.MessageId is returned", async () => {
    const messageId = "dummyId";

    (client.sendMessage().promise as jest.MockedFunction<
      any
    >).mockReturnValueOnce({ MessageId: messageId });

    const result = await sendMessage(client, sendMessageRequest, logger);

    expect(result).toEqual(right(messageId));

    expect(client.sendMessage).toBeCalledWith(sendMessageRequest);
    expect(client.sendMessage().promise).toBeCalledTimes(1);
  });
});

describe("sendMessageBatch", () => {
  beforeEach(() => {
    (client.sendMessageBatch().promise as jest.MockedFunction<any>).mockReset();
  });

  it("throws when AWS.SQS returns an error", async () => {
    client.sendMessageBatch().promise = jest
      .fn()
      .mockRejectedValue(new Error("such broke"));

    expect(await sendMessages(client, "url", messages, logger)).toEqual(
      left("ERROR")
    );
  });

  it("succeeds when AWS.SQS returns data", async () => {
    client.sendMessageBatch().promise = jest.fn().mockResolvedValue(result);

    // This test may seem unimpressive as we just pass the response.
    // But it is good for catching regressions.
    expect(await sendMessages(client, "url", messages, logger)).toEqual(
      right(result)
    );
  });
});

describe("getMessages", () => {
  beforeEach(() => {
    (client.receiveMessage().promise as jest.MockedFunction<any>).mockReset();
  });

  it("throws when the client returns an error", async () => {
    const errorMessageFromAWS = "something went wrong :(";

    client.receiveMessage().promise = jest
      .fn()
      .mockRejectedValue(new Error(errorMessageFromAWS));

    expect(await getMessages(client, "url", logger)).toEqual(left("ERROR"));
  });

  it("succeeds when the client returns data", async () => {
    // This test may seem unimpressive as we just pass the response.
    // But it is good for catching regressions.

    client.receiveMessage().promise = jest
      .fn()
      .mockResolvedValue({ Messages: messages });

    expect(await getMessages(client, "url", logger)).toEqual(right(messages));
  });
});

describe("getQueueUrlFromName", () => {
  beforeEach(() => {
    (client.getQueueUrl().promise as jest.MockedFunction<any>).mockReset();
  });

  it("returns a URL", async () => {
    const queueUrl = "https://myqueue.aws.com";

    client.getQueueUrl().promise = jest.fn().mockResolvedValue({
      QueueUrl: queueUrl,
    });

    expect(await getQueueUrlFromName(client, "my queue", logger)).toEqual(
      right(queueUrl)
    );
  });
});

describe("deleteMessageBatch", () => {
  beforeEach(() => {
    (client.deleteMessageBatch().promise as jest.MockedFunction<
      any
    >).mockReset();
  });

  it("returns error when client throws", async () => {
    client.deleteMessageBatch().promise = jest
      .fn()
      .mockRejectedValue(new Error("eek!"));

    expect(await deleteMessages(client, "url", messages, logger)).toEqual(
      left("ERROR")
    );
  });

  it("succeeds on happy path", async () => {
    // This test may seem unimpressive as we just pass the response.
    // But it is good for catching regressions.
    client.deleteMessageBatch().promise = jest.fn().mockResolvedValue(result);

    expect(await deleteMessages(client, "url", messages, logger)).toEqual(
      right(result)
    );
  });
});
