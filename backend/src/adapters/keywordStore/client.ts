import { KeywordData, keywordDataCodec } from "../../domain/models/keyword";
import { SocialMedia } from "../../domain/models/socialMedia";
import { getClient as getDynamodbClient } from "../../lib/dynamoDb";
import * as t from "io-ts";
import _ from "lodash";
import { decode } from "../../lib/iots";
import { map } from "fp-ts/lib/Either";

export const getClient = getDynamodbClient;

export const keywordDataDocCodec = t.intersection([
  keywordDataCodec,
  t.type({
    pk: t.string,
    sk: t.string,
    gsi1pk: t.union([t.string, t.undefined]),
    gsi1sk: t.string,
  }),
]);
export type KeywordDataDoc = t.TypeOf<typeof keywordDataDocCodec>;

export const toGSI1PK = (socialMedia: SocialMedia) => `${socialMedia}|active`;

export const domainToDocument = (domainItem: KeywordData): KeywordDataDoc => {
  return {
    ...domainItem,
    pk: domainItem.keyword,
    sk: domainItem.socialMedia,
    gsi1pk:
      domainItem.status == "ENABLED"
        ? toGSI1PK(domainItem.socialMedia)
        : undefined,
    gsi1sk: domainItem.keyword,
  };
};

export const documentToDomain = (docItem: KeywordDataDoc): KeywordData => {
  return _.omit(docItem, ["pk", "sk", "gsi1pk", "gsi1sk"]);
};

export const unknownToDomain = (item: unknown) => {
  return map(documentToDomain)(decode(keywordDataDocCodec, item));
};
