import { decode, fromEither } from "@diogovasconcelos/lib/iots";
import { UUID as IotsUUID } from "io-ts-types/lib/UUID";
import { v4 } from "uuid";

export type UUID = IotsUUID;
export const uuidCodec = IotsUUID;

export const uuid = (): UUID => {
  return fromEither(decode(uuidCodec, v4()));
};
