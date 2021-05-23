import * as t from "io-ts";
import { isLeft } from "fp-ts/lib/Either";
import { decode } from "./iots";

export const ensure = (name: string): string => {
  const value = process.env[name];
  if (value == null) {
    throw new Error(`Missing environment variable ${name}`);
  }

  return value;
};

export const ensureString = (value?: string): string => {
  if (value == undefined) {
    throw new Error(`Not a string, instead: ${value}`);
  }
  return value;
};

export const ensureAndDecode = <A>(
  name: string,
  codec: t.Decoder<unknown, A>
): A => {
  const value = process.env[name] ?? "";
  const decodeResult = decode(codec, JSON.parse(value));

  if (isLeft(decodeResult)) {
    throw Error(`Unexpected value environment variable ${name}:\n ${value}`);
  }

  return decodeResult.right;
};
