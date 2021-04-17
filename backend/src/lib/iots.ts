import * as t from "io-ts";
import { isRight, left, Either, isLeft } from "fp-ts/lib/Either";
import { PathReporter } from "io-ts/lib/PathReporter";
import * as ruins from "ruins-ts";
import { Logger } from "./logger";
import { DateFromISOString } from "io-ts-types";

export const fromEither = ruins.fromEither;

export const decode = <A>(
  codec: t.Decoder<unknown, A>,
  thing: unknown
): Either<string[], A> => {
  const result = codec.decode(thing);
  if (isRight(result)) {
    return result;
  } else {
    const errors = PathReporter.report(result);
    return left(errors);
  }
};

export const applyTransformToItem = <T, U>(
  transformFn: (item: U) => Either<string[], T>,
  item: U,
  logger: Logger
): Either<"ERROR", T> => {
  const transformResult = transformFn(item);

  if (isLeft(transformResult)) {
    logger.error("Unable to transform item", {
      item: JSON.stringify(item),
      error: transformResult.left,
    });
    return left("ERROR");
  }
  return transformResult;
};

// Useful sometimes, but doens't solve all the problems, as it doesn't create the "?" field
// more info: https://github.com/gcanti/io-ts/issues/56
export const optional = <T extends t.Mixed>(T: T) => t.union([t.undefined, T]);

// lower case: https://github.com/gcanti/io-ts/blob/master/index.md#branded-types--refinements
interface LowerCaseBrand {
  readonly LowerCase: unique symbol;
}

export const lowerCase = t.brand(
  t.string,
  (s): s is t.Branded<string, LowerCaseBrand> => s == s.toLocaleLowerCase(),
  "LowerCase" // the name must match the readonly field in the brand);
);

export type LowerCase = t.TypeOf<typeof lowerCase>;

// postive integer
interface PositiveIntegerBrand {
  readonly PositiveInteger: unique symbol;
}

export const positiveInteger = t.brand(
  t.number,
  (n): n is t.Branded<number, PositiveIntegerBrand> =>
    Number.isInteger(n) && n >= 0,
  "PositiveInteger"
);

export type PositiveInteger = t.TypeOf<typeof positiveInteger>;

// DateFromStringV2 (can convert from date as well (nice for redecoding))
// ref: https://github.com/gcanti/io-ts-types/blob/master/src/DateFromISOString.ts

export const DateFromISOStringV2 = new t.Type<Date, Date | string, unknown>(
  "DateFromISOString",
  (u): u is Date => u instanceof Date,
  (u, context) => {
    if (u instanceof Date) {
      return t.success(u as Date);
    }

    const decodeEither = DateFromISOString.decode(u);
    if (isLeft(decodeEither)) {
      return t.failure(u, context);
    }
    return t.success(decodeEither.right);
  },
  (a) => a.toISOString()
);
