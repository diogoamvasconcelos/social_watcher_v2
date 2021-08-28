import { makeGetSearchObject } from "@src/adapters/userStore/getSearchObject";
import { getLogger } from "@src/lib/logger";
import { uuid } from "@src/lib/uuid";
import { client, preparesGenericTable } from "@test/lib/dynamoDb";
import { defaultSearchObjectDomain } from "@test/lib/default";
import { makeCreateSearchObject } from "@src/adapters/userStore/createSearchObject";
import { deepmergeSafe } from "@diogovasconcelos/lib/deepmerge";
import { fromEither, newLowerCase } from "@diogovasconcelos/lib/iots";
import { isLeft } from "fp-ts/lib/Either";
import { directlyPutUserItemInTable } from "./shared";

describe("createSearchObject", () => {
  const logger = getLogger();
  const tableName: string = uuid();

  const getSearchObjectFn = makeGetSearchObject(client, tableName);
  const createSearchObjectFn = makeCreateSearchObject(client, tableName);

  beforeAll(() => {
    jest.setTimeout(45000);
  });

  beforeEach(async () => {
    await preparesGenericTable(tableName);
  });

  it("can searchObject, if nonexistent", async () => {
    const newSearchObject = deepmergeSafe(defaultSearchObjectDomain, {
      id: uuid(),
    });

    const createResult = fromEither(
      await createSearchObjectFn(logger, newSearchObject)
    );

    const getResult = fromEither(
      await getSearchObjectFn(logger, newSearchObject.id, newSearchObject.index)
    );

    expect(createResult).toEqual(newSearchObject);
    expect(getResult).toEqual(newSearchObject);
  });

  it("can't create searchObject if already exists", async () => {
    const initialSearchObject = defaultSearchObjectDomain;
    await directlyPutUserItemInTable(logger, {
      tableName,
      userItem: initialSearchObject,
    });

    const newSearchObject = deepmergeSafe(defaultSearchObjectDomain, {
      id: initialSearchObject.id,
      index: initialSearchObject.index,
      keyword: newLowerCase("another-keyword"),
    });

    const createResultEither = await createSearchObjectFn(
      logger,
      newSearchObject
    );

    const getResult = fromEither(
      await getSearchObjectFn(
        logger,
        initialSearchObject.id,
        initialSearchObject.index
      )
    );

    expect(isLeft(createResultEither)).toBeTruthy();
    expect(getResult).toEqual(initialSearchObject);
  });
});
