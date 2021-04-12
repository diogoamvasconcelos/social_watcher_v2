import { isLeft, left, right } from "fp-ts/lib/Either";
import { QueueSearchResultsFn } from "../../domain/ports/searchResultsQueue/queueSearchResults";
import { sendMessages } from "../../lib/sqs";
import { Client } from "./client";

export const makeQueueSearchResults = (
  client: Client,
  queueUrl: string
): QueueSearchResultsFn => {
  return async (logger, searchResults) => {
    const result = await sendMessages(
      client,
      queueUrl,
      searchResults.map((searchResult) => ({
        Body: JSON.stringify(searchResult),
      })),
      logger
    );
    if (isLeft(result)) {
      logger.error("sendMessages failed.", { error: result.left });
      return left("ERROR");
    }

    return right("OK");
  };
};
