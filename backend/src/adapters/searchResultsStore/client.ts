import {
  SearchResult,
  searchResultCodec,
} from "@src/domain/models/searchResult";
import { getClient as getDynamodbClient } from "@src/lib/dynamoDb";
import * as t from "io-ts";
import _ from "lodash";
import { map } from "fp-ts/lib/Either";
import { throwUnexpectedCase } from "@src/lib/runtime";
import { decode } from "@diogovasconcelos/lib/iots";

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

export const searchResultToPrimaryKey = (
  id: SearchResult["id"],
  index: number = 0 // to be used as a version/history index in case of future event sourcing approach or post-process that aggregates data
) => ({
  pk: id,
  sk: index.toString(),
});
export const toDocumentKeys = (
  {
    id,
    keyword,
    happenedAt,
  }: Pick<SearchResult, "id" | "keyword" | "happenedAt">,
  index: number = 0
) => ({
  ...searchResultToPrimaryKey(id, index),
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
  // not sure why, but need to do this to fix the typing
  switch (docItem.socialMedia) {
    case "twitter":
      return _.omit(docItem, ["pk", "sk", "gsi1pk", "gsi1sk"]);
    case "reddit":
      return _.omit(docItem, ["pk", "sk", "gsi1pk", "gsi1sk"]);
    case "hackernews":
      return _.omit(docItem, ["pk", "sk", "gsi1pk", "gsi1sk"]);
    case "instagram":
      return _.omit(docItem, ["pk", "sk", "gsi1pk", "gsi1sk"]);
    case "youtube":
      return _.omit(docItem, ["pk", "sk", "gsi1pk", "gsi1sk"]);
    default:
      return throwUnexpectedCase(docItem, "documentToSearchResult");
  }
};

export const unknownToSearchResult = (item: unknown) => {
  return map(documentToSearchResult)(decode(searchResultDocumentCodec, item));
};
