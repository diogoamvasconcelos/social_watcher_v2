import { DynamoDBStreamEvent } from "aws-lambda";
import { Converter } from "aws-sdk/clients/dynamodb";
import { userItemToDocument } from "../../adapters/userStore/client";
import { newPositiveInteger } from "../../lib/iots";
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
              nofSearchObjects: newPositiveInteger(0),
              subscriptionType: "NORMAL",
            })
          ),
        },
      },
    ],
  } as DynamoDBStreamEvent;

  it.skip("can handle a INSERT event", async () => {
    await expect(handler(event)).resolves.not.toThrow();
  });
});
