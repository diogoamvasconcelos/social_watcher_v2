import { makeGetSearchObject } from "../../../../../src/adapters/userStore/getSearchObject";
import { makeCreateSearchObject } from "../../../../../src/adapters/userStore/createSearchObject";
import { getLogger } from "../../../../../src/lib/logger";
import { uuid } from "../../../../../src/lib/uuid";
import { client, preparesGenericTable } from "../../../../lib/dynamoDb";
import { defaultSearchObjectDomain } from "../../../../lib/default";
import { makeUpdateSearchObject } from "../../../../../src/adapters/userStore/updateSearchObject";
import { deepmergeSafe } from "@diogovasconcelos/lib/deepmerge";
import { fromEither } from "@diogovasconcelos/lib/iots";
import { isLeft } from "fp-ts/lib/Either";

describe("updateSearchObject", () => {
  const logger = getLogger();
  const tableName: string = uuid();

  const getSearchObjectFn = makeGetSearchObject(client, tableName);
  const createSearchObjectFn = makeCreateSearchObject(client, tableName);
  const updateSearchObjectFn = makeUpdateSearchObject(client, tableName);

  beforeAll(() => {
    jest.setTimeout(45000);
  });

  beforeEach(async () => {
    await preparesGenericTable(tableName);
  });

  it("can update existing searchObject", async () => {
    const initialSearchObject = defaultSearchObjectDomain;
    fromEither(await createSearchObjectFn(logger, initialSearchObject));

    const updatedSearchObject = deepmergeSafe(initialSearchObject, {
      lockedStatus: "UNLOCKED",
    });
    const updateResult = fromEither(
      await updateSearchObjectFn(logger, updatedSearchObject)
    );

    const getResult = fromEither(
      await getSearchObjectFn(
        logger,
        updatedSearchObject.id,
        updatedSearchObject.index
      )
    );

    expect(updateResult).toEqual(updatedSearchObject);
    expect(getResult).toEqual(updatedSearchObject);
  });

  it("can't update non-existing searchObject", async () => {
    const nonExistingSearchObject = deepmergeSafe(defaultSearchObjectDomain, {
      id: uuid(),
    });

    const updateResultEither = await updateSearchObjectFn(
      logger,
      nonExistingSearchObject
    );

    const getResult = fromEither(
      await getSearchObjectFn(
        logger,
        nonExistingSearchObject.id,
        nonExistingSearchObject.index
      )
    );

    expect(isLeft(updateResultEither)).toBeTruthy();
    expect(getResult).toEqual("NOT_FOUND");
  });
});
