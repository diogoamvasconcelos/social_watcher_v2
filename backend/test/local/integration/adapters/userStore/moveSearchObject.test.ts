import { defaultSearchObjectDomain } from "@test/lib/default";
import { makeGetSearchObject } from "@src/adapters/userStore/getSearchObject";
import { makeGetSearchObjectsForUser } from "@src/adapters/userStore/getSearchObjectsForUser";
import { makeMoveSearchObject } from "@src/adapters/userStore/moveSearchObject";
import { makeCreateSearchObject } from "@src/adapters/userStore/createSearchObject";
import { getLogger } from "@src/lib/logger";
import { SearchObjectDomain } from "@src/domain/models/userItem";
import { uuid } from "@src/lib/uuid";
import { client, preparesGenericTable } from "@test/lib/dynamoDb";
import { deepmergeSafe } from "@diogovasconcelos/lib/deepmerge";
import {
  fromEither,
  newLowerCase,
  newPositiveInteger,
} from "@diogovasconcelos/lib/iots";
import _ from "lodash";

describe("moveSearchObject", () => {
  const logger = getLogger();
  const tableName: string = uuid();

  const getSearchObjectFn = makeGetSearchObject(client, tableName);
  const getSearchObjectsForUserFn = makeGetSearchObjectsForUser(
    client,
    tableName
  );
  const createSearchObjectFn = makeCreateSearchObject(client, tableName);
  const moveSearchObjectFn = makeMoveSearchObject(client, tableName);

  beforeAll(() => {
    jest.setTimeout(45000);
  });

  beforeEach(async () => {
    await preparesGenericTable(tableName);
  });

  it("can move searchObject, deleting old and updating locked status", async () => {
    const firstSearchObject = fromEither(
      await createSearchObjectFn(
        logger,
        deepmergeSafe(defaultSearchObjectDomain, {
          keyword: newLowerCase("first-keyword"),
          lockedStatus: "UNLOCKED",
        })
      )
    );

    const lastSearchObject = fromEither(
      await createSearchObjectFn(
        logger,
        deepmergeSafe(defaultSearchObjectDomain, {
          index: newPositiveInteger(1),
          keyword: newLowerCase("last-keyword"),
          lockedStatus: "LOCKED",
        })
      )
    );

    fromEither(
      await moveSearchObjectFn(logger, {
        originalSearchObject: lastSearchObject,
        newIndex: firstSearchObject.index,
        newLockedStatus: firstSearchObject.lockedStatus,
      })
    );

    const getFirstResult = fromEither(
      await getSearchObjectFn(
        logger,
        firstSearchObject.id,
        firstSearchObject.index
      )
    );

    const getLastResult = fromEither(
      await getSearchObjectFn(
        logger,
        lastSearchObject.id,
        lastSearchObject.index
      )
    );

    expect(getFirstResult).toEqual(
      deepmergeSafe(lastSearchObject, {
        index: firstSearchObject.index,
        lockedStatus: firstSearchObject.lockedStatus,
      })
    );
    expect(getLastResult).toEqual("NOT_FOUND");
  });

  it("moving last searchObject to the last position (same), should just delete", async () => {
    const nofSearchObjects = 5;
    const searchObjectsList: SearchObjectDomain[] = await Promise.all(
      _.range(nofSearchObjects).map(async (i) =>
        fromEither(
          await createSearchObjectFn(
            logger,
            deepmergeSafe(defaultSearchObjectDomain, {
              index: newPositiveInteger(i),
              keyword: newLowerCase(`keyword#${i}`),
            })
          )
        )
      )
    );

    const lastIndex = newPositiveInteger(nofSearchObjects - 1);
    const lastSearchObject = searchObjectsList[lastIndex];

    fromEither(
      await moveSearchObjectFn(logger, {
        originalSearchObject: lastSearchObject,
        newIndex: lastIndex,
        newLockedStatus: "UNLOCKED",
      })
    );

    const getLastResult = fromEither(
      await getSearchObjectFn(logger, defaultSearchObjectDomain.id, lastIndex)
    );
    expect(getLastResult).toEqual("NOT_FOUND");

    const getAllSearchObjects = fromEither(
      await getSearchObjectsForUserFn(logger, defaultSearchObjectDomain.id)
    );
    expect(getAllSearchObjects).toHaveLength(nofSearchObjects - 1);
    expect(getAllSearchObjects.includes(lastSearchObject)).toBeFalsy();
  });
});
