import { SQSEvent } from "aws-lambda";
import { isLeft } from "fp-ts/lib/Either";
import { searchJobCodec } from "../../domain/models/searchJob";
import { Logger } from "../../lib/logger";
import { translateSearchResults } from "../../domain/controllers/translateSearchResults";
import { SearchResult } from "../../domain/models/searchResult";
import { decode } from "@diogovasconcelos/lib/iots";
import { makePutSearchResults } from "../../adapters/searchResultsStore/putSearchResults";
import { getClient as getSearchResultStoreClient } from "../../adapters/searchResultsStore/client";
import { SearchSocialMediaFn } from "../../domain/ports/shared";
import { getClient as getTranslateClient } from "../../lib/translate";
import { makeTranslateToEnglish } from "../../adapters/translater/translateToEnglish";
import { getConfig } from "../../lib/config";

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
