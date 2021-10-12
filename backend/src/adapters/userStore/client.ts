import { getClient as getDynamodbClient } from "@src/lib/dynamoDb";
import * as t from "io-ts";
import _ from "lodash";
import { map, left, isLeft, right, Either } from "fp-ts/lib/Either";
import {
  PaymentData,
  ResultTag,
  SearchObjectDomain,
  searchObjectIoToDomain,
  UserData,
  UserItemDomain,
  userItemIoCodec,
} from "@src/domain/models/userItem";
import { throwUnexpectedCase } from "@src/lib/runtime";
import { decode } from "@diogovasconcelos/lib/iots";

export const getClient = getDynamodbClient;
export type Client = ReturnType<typeof getClient>;

export const userItemDocumentCodec = t.intersection([
  userItemIoCodec,
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

export const toUserItemDocumentKeys = (userItem: UserItemDomain) => {
  switch (userItem.type) {
    case "USER_DATA":
      return toUserDataDocumentKeys(userItem);
    case "SEARCH_OBJECT":
      return toSearchObjectDocumentKeys(userItem);
    case "PAYMENT_DATA":
      return toPaymentDataDocumentKeys(userItem);
    case "RESULT_TAG":
      return toResultTagDocumentKeys(userItem);
    default:
      return throwUnexpectedCase(userItem, "toUserItemDocKeys");
  }
};

export const toUserDataDocumentKeys = ({ id }: Pick<UserData, "id">) => ({
  pk: id,
  sk: "data",
});

export const toSearchObjectDocumentPartitionKeys = ({
  id,
  index,
}: Pick<SearchObjectDomain, "id" | "index">) => ({
  pk: id,
  sk: `keyword#${index}`,
});
export const toSearchObjectDocumentKeys = ({
  id,
  index,
  keyword,
}: Pick<SearchObjectDomain, "id" | "index" | "keyword">) => ({
  ...toSearchObjectDocumentPartitionKeys({ id, index }),
  gsi1pk: keyword,
  gsi1sk: id,
});

export const toPaymentDataDocumentKeys = ({ id }: Pick<PaymentData, "id">) => ({
  pk: id,
  sk: "payment",
});

export const toResultTagDocumentKeys = ({
  id,
  tagId,
}: Pick<ResultTag, "id" | "tagId">) => ({
  pk: id,
  sk: `resultTag#${tagId}`,
});

export const userItemToDocument = (
  domainItem: UserItemDomain
): UserItemDocument => {
  return {
    ...domainItem,
    ...toUserItemDocumentKeys(domainItem),
  };
};

export const documentToUserItem = (
  docItem: UserItemDocument
): UserItemDomain => {
  switch (docItem.type) {
    case "USER_DATA":
      return _.omit(docItem, ["pk", "sk"]);
    case "SEARCH_OBJECT":
      return searchObjectIoToDomain(
        _.omit(docItem, ["pk", "sk", "gsi1pk", "gsi1sk"])
      );
    case "PAYMENT_DATA":
      return _.omit(docItem, ["pk", "sk"]);
    case "RESULT_TAG":
      return _.omit(docItem, ["pk", "sk"]);
    default:
      return throwUnexpectedCase(docItem, "documentToUserItem");
  }
};

export const unknownToUserItem = (
  item: unknown
): Either<string[], UserItemDomain> => {
  return map(documentToUserItem)(decode(userItemDocumentCodec, item));
};

export const unknownToSearchObject = (
  item: unknown
): Either<string[], SearchObjectDomain> => {
  const userItemEither = unknownToUserItem(item);
  if (isLeft(userItemEither)) {
    return userItemEither;
  }
  const userItem = userItemEither.right;
  if (userItem.type !== "SEARCH_OBJECT") {
    return left([
      "ERROR",
      `User item is of type ${userItem.type}`,
      "Expected to be SEARCH_OBJECT",
    ]);
  }
  return right(userItem);
};

export const unknownToUser = (item: unknown): Either<string[], UserData> => {
  const userItemEither = unknownToUserItem(item);
  if (isLeft(userItemEither)) {
    return userItemEither;
  }
  const userItem = userItemEither.right;
  if (userItem.type !== "USER_DATA") {
    return left([
      "ERROR",
      `User item is of type ${userItem.type}`,
      "Expected to be USER_DATA",
    ]);
  }
  return right(userItem);
};

export const unknownToPaymentData = (
  item: unknown
): Either<string[], PaymentData> => {
  const userItemEither = unknownToUserItem(item);
  if (isLeft(userItemEither)) {
    return userItemEither;
  }
  const userItem = userItemEither.right;
  if (userItem.type !== "PAYMENT_DATA") {
    return left([
      "ERROR",
      `User item is of type ${userItem.type}`,
      "Expected to be USER_DATA",
    ]);
  }
  return right(userItem);
};

export const unknownToResultTag = (
  item: unknown
): Either<string[], ResultTag> => {
  const userItemEither = unknownToUserItem(item);
  if (isLeft(userItemEither)) {
    return userItemEither;
  }
  const userItem = userItemEither.right;
  if (userItem.type !== "RESULT_TAG") {
    return left([
      "ERROR",
      `User item is of type ${userItem.type}`,
      "Expected to be RESULT_TAG",
    ]);
  }
  return right(userItem);
};
