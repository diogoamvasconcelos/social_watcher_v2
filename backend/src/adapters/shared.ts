import * as t from "io-ts";
import { decode } from "../lib/iots";

export const docKeysCodec = t.intersection([
  t.type({
    pk: t.string,
    sk: t.string,
  }),
  t.partial({
    gsi1pk: t.string,
    gsi1sk: t.string,
  }),
]);

export const unknownToDocKeys = (item: unknown) => {
  return decode(docKeysCodec, item);
};
