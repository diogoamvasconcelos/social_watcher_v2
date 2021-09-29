import deepmerge from "deepmerge";
import { PartialDeep } from "type-fest";

export const deepmergeSafe = <T1, T2 extends PartialDeep<T1>>(
  x: T1,
  y: T2,
  options?: deepmerge.Options
) => {
  return deepmerge(x, y as Partial<T2>, options) as T1;
};
