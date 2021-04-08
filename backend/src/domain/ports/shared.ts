import { Either } from "fp-ts/lib/Either";

export type DefaultOkReturn = CustomRightReturn<"OK">;

export type CustomRightReturn<R> = CustomReturn<"ERROR", R>;

export type CustomReturn<L, R> = Promise<Either<L, R>>;
