import { getClient as getDynamodbClient } from "../../lib/dynamoDb";
import * as t from "io-ts";
import _ from "lodash";
import { decode } from "../../lib/iots";
import { map, left, isLeft, right } from "fp-ts/lib/Either";
import {
  SearchObject,
  UserData,
  UserItem,
  userItemCodec,
} from "../../domain/models/userItem";
import { throwUnexpectedCase } from "../../lib/runtime";

export const getClient = getDynamodbClient;
export type Client = ReturnType<typeof getClient>;

export const userItemDocumentCodec = t.intersection([
  userItemCodec,
  t.type({
    pk: t.string,
    sk: t.string,
  }),
  t.partial({
    gsi1pk: t.string,
    gsi1sk: t.string,
  }),
]);
export type UserItemDocument = t.TypeOf<typeof userItemDocumentCodec>;

export const toUserItemDocumentKeys = (userItem: UserItem) => {
  switch (userItem.type) {
    case "USER_DATA":
      return toUserDataDocumentKeys(userItem);
    case "SEARCH_OBJECT":
      return toSearchObjectDocumentKeys(userItem);
    default:
      return throwUnexpectedCase(userItem, "toUserItemDocKeys");
  }
};

export const toUserDataDocumentKeys = ({ id }: Pick<UserData, "id">) => ({
  pk: id,
  sk: "data",
});

export const toSearchObjectDocumentKeys = ({
  id,
  index,
  keyword,
}: Pick<SearchObject, "id" | "index" | "keyword">) => ({
  pk: id,
  sk: `keyword#${index}`,
  gsi1pk: keyword,
  gsi1sk: id,
});

export const userItemToDocument = (domainItem: UserItem): UserItemDocument => {
  return {
    ...domainItem,
    ...toUserItemDocumentKeys(domainItem),
  };
};

export const documentToUserItem = (docItem: UserItemDocument): UserItem => {
  switch (docItem.type) {
    case "USER_DATA":
      return _.omit(docItem, ["pk", "sk"]);
    case "SEARCH_OBJECT":
      return _.omit(docItem, ["pk", "sk", "gsi1pk", "gsi1sk"]);
    default:
      return throwUnexpectedCase(docItem, "documentToUserItem");
  }
};

export const unknownToUserItem = (item: unknown) => {
  return map(documentToUserItem)(decode(userItemDocumentCodec, item));
};

export const unknownToSearchObject = (item: unknown) => {
  const userItemEither = unknownToUserItem(item);
  if (isLeft(userItemEither)) {
    return userItemEither;
  }
  const userItem = userItemEither.right;
  if (userItem.type === "USER_DATA") {
    return left([
      "ERROR",
      "User item is of type USER_DATA",
      "Expected to be SEARCH_OBJECT",
    ]);
  }
  return right(userItem);
};

export const unknownToUser = (item: unknown) => {
  const userItemEither = unknownToUserItem(item);
  if (isLeft(userItemEither)) {
    return userItemEither;
  }
  const userItem = userItemEither.right;
  if (userItem.type === "SEARCH_OBJECT") {
    return left([
      "ERROR",
      "User item is of type SEARCH_OBJECT",
      "Expected to be USER_DATA",
    ]);
  }
  return right(userItem);
};
