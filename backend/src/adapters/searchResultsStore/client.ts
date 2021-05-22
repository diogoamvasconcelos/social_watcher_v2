import {
  SearchResult,
  searchResultCodec,
} from "../../domain/models/searchResult";
import { getClient as getDynamodbClient } from "../../lib/dynamoDb";
import * as t from "io-ts";
import _ from "lodash";
import { decode } from "@diogovasconcelos/lib";
import { map } from "fp-ts/lib/Either";

export const getClient = getDynamodbClient;
export type Client = ReturnType<typeof getClient>;

export const searchResultDocumentCodec = t.intersection([
  searchResultCodec,
  t.type({
    pk: t.string,
    sk: t.string,
    gsi1pk: t.string,
    gsi1sk: t.string,
  }),
]);
export type SearchResultDocument = t.TypeOf<typeof searchResultDocumentCodec>;

export const toDocumentKeys = (
  { socialMedia, id, keyword, happenedAt }: SearchResult,
  index: number = 0
) => ({
  pk: `${socialMedia}|${id}`,
  sk: index.toString(),
  gsi1pk: keyword,
  gsi1sk: happenedAt,
});

export const searchResultToDocument = (
  domainItem: SearchResult
): SearchResultDocument => {
  return { ...domainItem, ...toDocumentKeys(domainItem) };
};

export const documentToSearchResult = (
  docItem: SearchResultDocument
): SearchResult => {
  return _.omit(docItem, ["pk", "sk", "gsi1pk", "gsi1sk"]);
};

export const unknownToSearchResult = (item: unknown) => {
  return map(documentToSearchResult)(decode(searchResultDocumentCodec, item));
};
