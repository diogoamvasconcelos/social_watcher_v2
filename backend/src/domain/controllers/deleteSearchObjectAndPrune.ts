import { right } from "fp-ts/lib/Either";
import { Logger } from "../../lib/logger";
import { SearchObjectDomain } from "../models/userItem";
import { DefaultOkReturn } from "../ports/shared";

export type DeleteSearchObjectAndPruneDeps = {
  logger: Logger;
  searchObjectKeys: Pick<SearchObjectDomain, "id" | "index">;
};

// Warning: race condition, if an update is made to the searchObject that will replace the one being deleted
export const deleteSearchObjectAndPrune = async ({
  logger,
  searchObjectKeys: { id, index },
}: DeleteSearchObjectAndPruneDeps): DefaultOkReturn => {
  logger.info(`TODO: implement the deletion of ${id}:${index}`);
  return right("OK");
};
