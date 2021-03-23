import { Either } from "fp-ts/lib/Either";

export type GenericReturn = CustomRightReturn<"OK">;

export type CustomRightReturn<R> = CustomReturn<"ERROR", R>;

export type CustomReturn<L, R> = Promise<Either<L, R>>;
