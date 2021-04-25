import { DynamoDBStreamEvent } from "aws-lambda";
import { Converter } from "aws-sdk/clients/dynamodb";
import { searchResultToDocument } from "../../adapters/searchResultsStore/client";
import { newLowerCase } from "../../lib/iots";
import { handler } from "./searchResultsStreamConsumer";

describe("handlers/searchResultsStreamConsumer", () => {
  const event: DynamoDBStreamEvent = {
    Records: [
      {
        eventName: "INSERT",
        dynamodb: {
          NewImage: Converter.marshall(
            searchResultToDocument({
              id: "some-id",
              keyword: newLowerCase("some-keyword"),
              happenedAt: new Date(),
              socialMedia: "twitter",
              data: {
                id: "some-id",
                text: "some-text",
                created_at: new Date(),
                conversation_id: "some-conversation-id",
                author_id: "some-author-id",
                lang: "en",
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
