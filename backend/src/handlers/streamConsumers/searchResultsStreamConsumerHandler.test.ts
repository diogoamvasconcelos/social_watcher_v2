import { newLowerCase } from "@diogovasconcelos/lib/iots";
import { DynamoDBStreamEvent } from "aws-lambda";
import { Converter } from "aws-sdk/clients/dynamodb";
import { searchResultToDocument } from "@src/adapters/searchResultsStore/client";
import { getNow } from "@src/lib/date";
import { handler } from "./searchResultsStreamConsumerHandler";
import { toUniqueId } from "@src/domain/models/searchResult";

describe("handlers/searchResultsStreamConsumer", () => {
  const event: DynamoDBStreamEvent = {
    Records: [
      {
        eventName: "INSERT",
        dynamodb: {
          NewImage: Converter.marshall(
            searchResultToDocument({
              id: toUniqueId({ socialMedia: "twitter", localId: "some-id" }),
              localId: "some-id",
              keyword: newLowerCase("some-keyword"),
              happenedAt: getNow(),
              socialMedia: "twitter",
              link: "some-link",
              data: {
                id: "some-id",
                text: "some-text",
                created_at: getNow(),
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
