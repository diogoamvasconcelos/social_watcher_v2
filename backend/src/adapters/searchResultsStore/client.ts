import {
  SearchResult,
  searchResultCodec,
} from "../../domain/models/searchResult";
import { getClient as getDynamodbClient } from "../../lib/dynamoDb";
import * as t from "io-ts";
import _ from "lodash";
import { decode } from "../../lib/iots";
import { map } from "fp-ts/lib/Either";

export const getClient = getDynamodbClient;
export type Client = ReturnType<typeof getClient>;

export const searchResultDocCodec = t.intersection([
  searchResultCodec,
  t.type({
    pk: t.string,
    sk: t.string,
    gsi1pk: t.string,
    gsi1sk: t.string,
  }),
]);
export type SearchResultDoc = t.TypeOf<typeof searchResultDocCodec>;

export const toDocKeys = (
  { socialMedia, id, keyword, happened_at }: SearchResult,
  index: number = 0
) => ({
  pk: `${socialMedia}|${id}`,
  sk: index.toString(),
  gsi1pk: keyword,
  gsi1sk: happened_at.toISOString(),
});

export const searchResultToDocument = (domainItem: SearchResult) => {
  return { ...domainItem, ...toDocKeys(domainItem) };
};

export const documentToSearchResult = (
  docItem: SearchResultDoc
): SearchResult => {
  return _.omit(docItem, ["pk", "sk", "gsi1pk", "gsi1sk"]);
};

export const unknownToSearchResult = (item: unknown) => {
  return map(documentToSearchResult)(decode(searchResultDocCodec, item));
};
