import { newPositiveInteger } from "@diogovasconcelos/lib/iots";
import { DynamoDBStreamEvent } from "aws-lambda";
import { Converter } from "aws-sdk/clients/dynamodb";
import { userItemToDocument } from "@src/adapters/userStore/client";
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
              subscription: {
                status: "ACTIVE",
                type: "NORMAL",
                nofSearchObjects: newPositiveInteger(0),
              },
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
