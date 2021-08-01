import { JsonObjectEncodable } from "@diogovasconcelos/lib/models/jsonEncodable";
import { Either, isLeft, left, right } from "fp-ts/lib/Either";
import _ from "lodash";
import { Logger } from "../../lib/logger";
import { Keyword } from "../models/keyword";
import { SearchResult } from "../models/searchResult";

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

// +++++++++++++
// + Searchers +
// +++++++++++++
export type SearchSocialMediaFn<T extends SearchResult> = (
  logger: Logger,
  keyword: Keyword
) => CustomRightReturn<T[]>;

// +++++++++++++
// + QueueJobs +
// +++++++++++++
export type QueueJobsFn<T extends string, J extends JsonObjectEncodable> = (
  logger: Logger,
  queueNameInput: T,
  jobs: J[]
) => DefaultOkReturn;
