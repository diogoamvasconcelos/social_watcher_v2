import { getClient as getDynamodbClient } from "../../lib/dynamoDb";
import * as t from "io-ts";
import _ from "lodash";
import { decode } from "../../lib/iots";
import { map } from "fp-ts/lib/Either";
import { User, userCodec } from "../../domain/models/user";

export const getClient = getDynamodbClient;
export type Client = ReturnType<typeof getClient>;

export const userDocCodec = t.intersection([
  userCodec,
  t.intersection([
    t.type({
      pk: t.string,
      sk: t.string,
    }),
    t.partial({
      gsi1pk: t.string,
      gsi1sk: t.string,
    }),
  ]),
]);
export type UserDoc = t.TypeOf<typeof userDocCodec>;

export const toUserDocKeys = ({ id }: Pick<User, "id">) => ({
  pk: id,
  sk: "data",
});

export const userToDocument = (user: User): UserDoc => {
  return { ...user, ...toUserDocKeys(user) };
};

export const documentToUser = (docItem: UserDoc): User => {
  return _.omit(docItem, ["pk", "sk", "gsi1pk", "gsi1sk"]);
};

export const unknownToUser = (item: unknown) => {
  return map(documentToUser)(decode(userDocCodec, item));
};
