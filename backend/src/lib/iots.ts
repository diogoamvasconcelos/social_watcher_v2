import * as t from "io-ts";
import { isRight, left, Either, isLeft } from "fp-ts/lib/Either";
import { PathReporter } from "io-ts/lib/PathReporter";
import * as ruins from "ruins-ts";
import { Logger } from "./logger";

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
