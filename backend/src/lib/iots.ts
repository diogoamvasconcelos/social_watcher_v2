import { left, Either, isLeft } from "fp-ts/lib/Either";
import { Logger } from "./logger";

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
