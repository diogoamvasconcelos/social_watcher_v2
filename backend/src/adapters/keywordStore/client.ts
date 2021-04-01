import { KeywordData, keywordDataCodec } from "../../domain/models/keyword";
import { SocialMedia } from "../../domain/models/socialMedia";
import { getClient as getDynamodbClient } from "../../lib/dynamoDb";
import * as t from "io-ts";
import _ from "lodash";
import { decode, optional } from "../../lib/iots";
import { map } from "fp-ts/lib/Either";

export const getClient = getDynamodbClient;
export type Client = ReturnType<typeof getClient>;

export const keywordDataDocCodec = t.intersection([
  keywordDataCodec,
  t.type({
    pk: t.string,
    sk: t.string,
    gsi1pk: optional(t.string),
    gsi1sk: t.string,
  }),
]);
export type KeywordDataDoc = t.TypeOf<typeof keywordDataDocCodec>;

export const toGSI1PK = (socialMedia: SocialMedia) => `${socialMedia}|active`;

export const toDocKeys = ({ socialMedia, keyword, status }: KeywordData) => ({
  pk: keyword,
  sk: socialMedia,
  gsi1pk: status == "ENABLED" ? toGSI1PK(socialMedia) : undefined,
  gsi1sk: keyword,
});

export const domainToDocument = (domainItem: KeywordData) => {
  return { ...domainItem, ...toDocKeys(domainItem) };
};

export const documentToDomain = (docItem: KeywordDataDoc): KeywordData => {
  return _.omit(docItem, ["pk", "sk", "gsi1pk", "gsi1sk"]);
};

export const unknownToDomain = (item: unknown) => {
  return map(documentToDomain)(decode(keywordDataDocCodec, item));
};
