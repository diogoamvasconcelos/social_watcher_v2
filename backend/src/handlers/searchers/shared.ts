import { SQSEvent } from "aws-lambda/trigger/sqs";
import { isLeft } from "fp-ts/lib/Either";
import { searchJobCodec } from "@src/domain/models/searchJob";
import { Logger } from "@src/lib/logger";
import { translateSearchResults } from "@src/domain/controllers/translateSearchResults";
import { SearchResult } from "@src/domain/models/searchResult";
import { decode } from "@diogovasconcelos/lib/iots";
import { makePutSearchResults } from "@src/adapters/searchResultsStore/putSearchResults";
import { getClient as getSearchResultStoreClient } from "@src/adapters/searchResultsStore/client";
import { SearchSocialMediaFn } from "@src/domain/ports/shared";
import { getClient as getTranslateClient } from "@src/lib/translate";
import { makeTranslateToEnglish } from "@src/adapters/translater/translateToEnglish";
import { getConfig } from "@src/lib/config";

export const makeSearcherHandler = <T extends SearchResult>({
  logger,
  searchSocialMediaFn,
}: {
  logger: Logger;
  searchSocialMediaFn: SearchSocialMediaFn<T>;
}) => {
  return async (event: SQSEvent) => {
    const config = getConfig();
    const translateClient = getTranslateClient();
    const translateToEnglishFn = makeTranslateToEnglish(translateClient);
    const searchResultStoreClient = getSearchResultStoreClient();
    const putSearchResultFn = makePutSearchResults(
      searchResultStoreClient,
      config.searchResultsTableName
    );

    await Promise.all(
      event.Records.map(async (record) => {
        const decodeResult = decode(searchJobCodec, JSON.parse(record.body));
        if (isLeft(decodeResult)) {
          throw new Error("Failed to decode search job");
        }

        const searchResultsEither = await searchSocialMediaFn(
          logger,
          decodeResult.right.keyword
        );
        if (isLeft(searchResultsEither)) {
          throw new Error("Failed to search");
        }
        logger.debug(
          `Found ${searchResultsEither.right.length} items for: ${decodeResult.right.keyword}`
        );

        const searchResults: SearchResult[] = await translateSearchResults(
          { translateToEnglishFn, logger },
          searchResultsEither.right
        );

        const putResult = await putSearchResultFn(logger, searchResults);
        if (isLeft(putResult)) {
          throw new Error("Failed to put results");
        }
      })
    );
  };
};
