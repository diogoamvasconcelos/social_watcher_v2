import * as t from "io-ts";
import { isRight, left, Either } from "fp-ts/lib/Either";
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
