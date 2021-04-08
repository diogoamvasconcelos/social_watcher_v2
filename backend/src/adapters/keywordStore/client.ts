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

export const toDocPrimaryKeys = ({
  socialMedia,
  keyword,
}: Pick<KeywordData, "socialMedia" | "keyword">) => ({
  pk: keyword,
  sk: socialMedia,
});

export const toDocKeys = ({ socialMedia, keyword, status }: KeywordData) => ({
  ...toDocPrimaryKeys({ socialMedia, keyword }),
  gsi1pk: status == "ACTIVE" ? toGSI1PK(socialMedia) : undefined,
  gsi1sk: keyword,
});

export const keywordDataToDocument = (domainItem: KeywordData) => {
  return { ...domainItem, ...toDocKeys(domainItem) };
};

export const documentToKeywordData = (docItem: KeywordDataDoc): KeywordData => {
  return _.omit(docItem, ["pk", "sk", "gsi1pk", "gsi1sk"]);
};

export const unknownToKeywordData = (item: unknown) => {
  return map(documentToKeywordData)(decode(keywordDataDocCodec, item));
};
