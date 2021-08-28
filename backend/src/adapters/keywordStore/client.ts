import { KeywordData, keywordDataCodec } from "@src/domain/models/keyword";
import { SocialMedia } from "@src/domain/models/socialMedia";
import { getClient as getDynamodbClient } from "@src/lib/dynamoDb";
import * as t from "io-ts";
import _ from "lodash";
import { map } from "fp-ts/lib/Either";
import { decode, optional } from "@diogovasconcelos/lib/iots";

export const getClient = getDynamodbClient;
export type Client = ReturnType<typeof getClient>;

export const keywordDataDocumentCodec = t.intersection([
  keywordDataCodec,
  t.type({
    pk: t.string,
    sk: t.string,
    gsi1pk: optional(t.string),
    gsi1sk: t.string,
  }),
]);
export type KeywordDataDocument = t.TypeOf<typeof keywordDataDocumentCodec>;

export const toGSI1PK = (socialMedia: SocialMedia) => `${socialMedia}|active`;

export const toDocumentPrimaryKeys = ({
  socialMedia,
  keyword,
}: Pick<KeywordData, "socialMedia" | "keyword">) => ({
  pk: keyword,
  sk: socialMedia,
});

export const toDocumentKeys = ({
  socialMedia,
  keyword,
  status,
}: KeywordData) => ({
  ...toDocumentPrimaryKeys({ socialMedia, keyword }),
  gsi1pk: status == "ACTIVE" ? toGSI1PK(socialMedia) : undefined,
  gsi1sk: keyword,
});

export const keywordDataToDocument = (domainItem: KeywordData) => {
  return { ...domainItem, ...toDocumentKeys(domainItem) };
};

export const documentToKeywordData = (
  docItem: KeywordDataDocument
): KeywordData => {
  return _.omit(docItem, ["pk", "sk", "gsi1pk", "gsi1sk"]);
};

export const unknownToKeywordData = (item: unknown) => {
  return map(documentToKeywordData)(decode(keywordDataDocumentCodec, item));
};
