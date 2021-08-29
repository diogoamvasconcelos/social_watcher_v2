import * as t from "io-ts";
import { isRight, left, Either, isLeft, right } from "fp-ts/lib/Either";
import * as A from "fp-ts/lib/Array";
import { PathReporter } from "io-ts/lib/PathReporter";
import * as ruins from "ruins-ts";
import { DateFromISOString, NumberFromString } from "io-ts-types";
import isEmail from "validator/lib/isEmail";

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

export const toSingleEither = <L, R>(
  eithers: Either<L, R>[]
): Either<L[], R[]> => {
  const separated = A.separate(eithers);
  if (separated.left.length > 0) {
    return left(separated.left);
  } else {
    return right(separated.right);
  }
};

export const toRightOrUndefined = <L, R>(either: Either<L, R>) => {
  return isRight(either) ? either.right : undefined;
};

// Useful sometimes, but doens't solve all the problems, as it doesn't create the "?" field
// more info: https://github.com/gcanti/io-ts/issues/56
export const optional = <T extends t.Mixed>(T: T) => t.union([t.undefined, T]);
export const nullable = <T extends t.Mixed>(T: T) => t.union([t.null, T]);
export const optionalNull = <T extends t.Mixed>(T: T) =>
  t.union([t.undefined, t.null, T]);

// lower case: https://github.com/gcanti/io-ts/blob/master/index.md#branded-types--refinements
export interface LowerCaseBrand {
  readonly LowerCase: unique symbol;
}

export const lowerCase = t.brand(
  t.string,
  (u): u is t.Branded<string, LowerCaseBrand> => u == u.toLocaleLowerCase(),
  "LowerCase" // the name must match the readonly field in the brand);
);

export type LowerCase = t.TypeOf<typeof lowerCase>;

export const newLowerCase = (x: string): LowerCase =>
  fromEither(decode(lowerCase, x.toLowerCase()));

// postive integer
export interface PositiveIntegerBrand {
  readonly PositiveInteger: unique symbol;
}

export const positiveInteger = t.brand(
  t.number,
  (u): u is t.Branded<number, PositiveIntegerBrand> =>
    Number.isInteger(u) && u >= 0,
  "PositiveInteger"
);

export type PositiveInteger = t.TypeOf<typeof positiveInteger>;

export const newPositiveInteger = (x: number | string): PositiveInteger =>
  fromEither(decode(positiveInteger, x));

// DateFromStringV2 (can convert from date as well (nice for redecoding)) - NOT USED
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

// DateISOString
// Good practive to store dates as strings for serialization, and only convert to Date when needed

export interface DateISOStringBrand {
  readonly DateISOString: unique symbol;
}

export const dateISOString = t.brand(
  new t.Type<string>(
    "ISO8601 timestamp",
    t.string.is,
    (x, context) => {
      try {
        const result = DateFromISOString.decode(x);
        if (isLeft(result)) {
          return t.failure(x, context);
        }

        const normalizedIsoTimestamp = result.right.toISOString();
        return t.success(normalizedIsoTimestamp);
      } catch (_error) {
        return t.failure(x, context);
      }
    },
    String
  ),
  (u): u is t.Branded<string, DateISOStringBrand> =>
    isRight(DateFromISOString.decode(u)),
  "DateISOString"
);

export type DateISOString = t.TypeOf<typeof dateISOString>;

export const newDateISOString = (x: string): DateISOString =>
  fromEither(decode(dateISOString, x));

// EmailFromString

export interface EmailFromStringBrand {
  readonly EmailFromString: unique symbol;
}

export const emailFromString = t.brand(
  t.string,
  (u): u is t.Branded<string, EmailFromStringBrand> => isEmail(u),
  "EmailFromString" // the name must match the readonly field in the brand);
);

export type EmailFromString = t.TypeOf<typeof emailFromString>;

export const newEmailFromString = (x: string): EmailFromString =>
  fromEither(decode(emailFromString, x));

// NumberFromStringy (better than io-ts-types)

export interface NumberFromStringyBrand {
  readonly NumberFromStringy: unique symbol;
}

export const numberFromStringy = t.brand(
  t.string,
  (u): u is t.Branded<string, NumberFromStringyBrand> =>
    isRight(NumberFromString.decode(u)),
  "NumberFromStringy" // the name must match the readonly field in the brand);
);

export type NumberFromStringy = t.TypeOf<typeof numberFromStringy>;

export const newNumberFromStringy = (x: string): NumberFromStringy =>
  fromEither(decode(numberFromStringy, x));
