import { getClient as getDynamodbClient } from "../../lib/dynamoDb";
import * as t from "io-ts";
import _ from "lodash";
import { decode, optional } from "../../lib/iots";
import { map } from "fp-ts/lib/Either";
import { User, userCodec } from "../../domain/models/user";

export const getClient = getDynamodbClient;
export type Client = ReturnType<typeof getClient>;

export const userDocCodec = t.intersection([
  userCodec,
  t.type({
    pk: t.string,
    sk: t.string,
    gsi1pk: optional(t.string),
    gsi1sk: optional(t.string),
  }),
]);
export type UserDoc = t.TypeOf<typeof userDocCodec>;

export const toUserDocKeys = ({ email }: User) => ({
  pk: email,
  sk: "data",
  gsi1pk: undefined,
  gsi1sk: undefined,
});

export const userToDocument = (user: User): UserDoc => {
  return { ...user, ...toUserDocKeys(user) };
};

export const documentToDomain = (docItem: UserDoc): User => {
  return _.omit(docItem, ["pk", "sk", "gsi1pk", "gsi1sk"]);
};

export const unknownToDomain = (item: unknown) => {
  return map(documentToDomain)(decode(userDocCodec, item));
};
