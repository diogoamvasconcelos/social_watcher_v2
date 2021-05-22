import { UUID as IotsUUID, UUID as IotsUUIDCodec } from "io-ts-types/lib/UUID";
import { v4 } from "uuid";
import { decode, fromEither } from "@diogovasconcelos/lib";

export type UUID = IotsUUID;
export const UUIDCodec = IotsUUIDCodec;

export const uuid = (): UUID => {
  return fromEither(decode(UUIDCodec, v4()));
};
