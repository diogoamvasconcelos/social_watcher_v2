import {
  fromEither,
  newLowerCase,
  newPositiveInteger,
} from "@diogovasconcelos/lib/iots";
import { right } from "fp-ts/lib/Either";
import _ from "lodash";
import { SearchObjectDomain } from "../models/userItem";
import { GetSearchObjectsForUserFn } from "../ports/userStore/getSearchObjectsForUser";
import { deepmergeSafe } from "@diogovasconcelos/lib/deepmerge";
import { defaultSearchObjectDomain } from "../../../test/lib/default";
import { deleteSearchObjectAndPrune } from "./deleteSearchObjectAndPrune";
import { MoveSearchObjectFn } from "../ports/userStore/moveSearchObject";
import { getLogger } from "../../lib/logger";

const logger = getLogger();

const getSearchObjectsForUserFnMocked =
  jest.fn() as jest.MockedFunction<GetSearchObjectsForUserFn>;
const moveSearchObjectFnMocked =
  jest.fn() as jest.MockedFunction<MoveSearchObjectFn>;

describe("controllers/deleteSearchObjectAndPrune", () => {
  beforeEach(() => {
    getSearchObjectsForUserFnMocked.mockReset();
  });

  it("tries to move the last search object to the place to delete", async () => {
    const nofSearchObjects = 5;
    const toDeleteIndex = 3;
    const searchObjectsList: SearchObjectDomain[] = _.range(
      nofSearchObjects
    ).map((i) =>
      deepmergeSafe(defaultSearchObjectDomain, {
        index: newPositiveInteger(i),
        keyword: newLowerCase(`keyword#${i}`),
      })
    );

    getSearchObjectsForUserFnMocked.mockResolvedValueOnce(
      right(searchObjectsList)
    );
    moveSearchObjectFnMocked.mockResolvedValueOnce(right("OK"));

    fromEither(
      await deleteSearchObjectAndPrune({
        logger,
        getSearchObjectsForUserFn: getSearchObjectsForUserFnMocked,
        moveSearchObjectFn: moveSearchObjectFnMocked,
        searchObjectKeys: searchObjectsList[toDeleteIndex],
      })
    );

    expect(moveSearchObjectFnMocked).toHaveBeenCalledTimes(1);
    expect(moveSearchObjectFnMocked).toHaveBeenCalledWith(logger, {
      originalSearchObject: searchObjectsList[nofSearchObjects - 1],
      newIndex: searchObjectsList[toDeleteIndex].index,
      newLockedStatus: searchObjectsList[toDeleteIndex].lockedStatus,
    });
  });
});
