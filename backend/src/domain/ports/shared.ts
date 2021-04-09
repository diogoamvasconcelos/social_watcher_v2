import { Either, isLeft, left, right } from "fp-ts/lib/Either";
import _ from "lodash";

export type DefaultOkReturn = CustomRightReturn<"OK">;

export type CustomRightReturn<R> = CustomReturn<"ERROR", R>;

export type CustomReturn<L, R> = Promise<Either<L, R>>;

export const eitherListToDefaultOk = async (
  eitherList: Either<unknown, unknown>[]
): DefaultOkReturn => {
  if (_.some(eitherList, (result) => isLeft(result))) {
    return left("ERROR");
  }
  return right("OK");
};
