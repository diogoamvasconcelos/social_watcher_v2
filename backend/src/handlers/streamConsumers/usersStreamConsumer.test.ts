import { DynamoDBStreamEvent } from "aws-lambda";
import { Converter } from "aws-sdk/clients/dynamodb";
import { userItemToDocument } from "../../adapters/userStore/client";
import { decode, fromEither, positiveInteger } from "../../lib/iots";
import { handler } from "./usersStreamConsumer";

describe("handlers/usersStreamConsumer", () => {
  const event: DynamoDBStreamEvent = {
    Records: [
      {
        eventName: "INSERT",
        dynamodb: {
          NewImage: Converter.marshall(
            userItemToDocument({
              type: "USER_DATA",
              id: "some-id",
              email: "some@email.com",
              subscriptionStatus: "ACTIVE",
              nofSearchObjects: fromEither(decode(positiveInteger, 0)),
              subscriptionType: "NORMAL",
            })
          ),
        },
      },
    ],
  } as DynamoDBStreamEvent;

  it("can handle a INSERT event", async () => {
    expect(fromEither(await handler(event))).toEqual("OK");
  });
});
