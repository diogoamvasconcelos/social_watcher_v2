import { getClient as getDynamodbClient } from "../../lib/dynamoDb";
import * as t from "io-ts";
import _ from "lodash";
import { decode } from "../../lib/iots";
import { map } from "fp-ts/lib/Either";
import { User, userCodec } from "../../domain/models/user";
import {
  SearchObject,
  searchObjectCodec,
} from "../../domain/models/searchObject";

export const getClient = getDynamodbClient;
export type Client = ReturnType<typeof getClient>;

// ++++++++
// + User +
// ++++++++

export const userDocCodec = t.intersection([
  userCodec,
  t.type({
    pk: t.string,
    sk: t.string,
  }),
]);
export type UserDoc = t.TypeOf<typeof userDocCodec>;

export const toUserDocKeys = ({ id }: Pick<User, "id">) => ({
  pk: id,
  sk: "data",
});

export const userToDocument = (domainItem: User): UserDoc => {
  return { ...domainItem, ...toUserDocKeys(domainItem) };
};

export const documentToUser = (docItem: UserDoc): User => {
  return _.omit(docItem, ["pk", "sk"]);
};

export const unknownToUser = (item: unknown) => {
  return map(documentToUser)(decode(userDocCodec, item));
};

// ++++++++++++++++
// + SearchObject +
// ++++++++++++++++

export const searchObjectDocCodec = t.intersection([
  searchObjectCodec,
  t.type({
    pk: t.string,
    sk: t.string,
    gsi1pk: t.string,
    gsi1sk: t.string,
  }),
]);
export type SearchObjectDoc = t.TypeOf<typeof searchObjectDocCodec>;

export const toSearchObjectDocKeys = ({
  userId,
  index,
  keyword,
}: Pick<SearchObject, "userId" | "index" | "keyword">) => ({
  pk: userId,
  sk: `keyword#${index}`,
  gsi1pk: keyword,
  gsi1sk: userId,
});

export const searchObjectToDocument = (
  domainItem: SearchObject
): SearchObjectDoc => {
  return { ...domainItem, ...toSearchObjectDocKeys(domainItem) };
};

export const documentToSearchObject = (
  docItem: SearchObjectDoc
): SearchObject => {
  return _.omit(docItem, ["pk", "sk", "gsi1pk", "gsi1sk"]);
};

export const unknownToSearchObject = (item: unknown) => {
  return map(documentToSearchObject)(decode(searchObjectDocCodec, item));
};
