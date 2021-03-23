import * as t from "io-ts";
import { isRight, left, Either, isLeft } from "fp-ts/lib/Either";
import { PathReporter } from "io-ts/lib/PathReporter";
import * as ruins from "ruins-ts";

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
  item: U
): Either<"ERROR", T> => {
  const transformResult = transformFn(item);

  if (isLeft(transformResult)) {
    console.error(
      "Unable to transform item.\n" +
        "Item:\n" +
        JSON.stringify(item) +
        "Errors:\n" +
        JSON.stringify(transformResult.left)
    );
    return left("ERROR");
  }
  return transformResult;
};

export const optional = <T extends t.Mixed>(T: T) => t.union([t.undefined, T]);
