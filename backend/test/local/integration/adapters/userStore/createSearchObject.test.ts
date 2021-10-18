import { makeGetSearchObject } from "@src/adapters/userStore/getSearchObject";
import { getLogger } from "@src/lib/logger";
import { uuid } from "@src/lib/uuid";
import { client, preparesGenericTable } from "@test/lib/dynamoDb";
import { makeCreateSearchObject } from "@src/adapters/userStore/createSearchObject";
import { fromEither, newLowerCase } from "@diogovasconcelos/lib/iots";
import { isLeft } from "fp-ts/lib/Either";
import { directlyPutUserItemInTable } from "./shared";
import { buildSearchObjectDomain } from "@test/lib/builders";

jest.setTimeout(45000);

const defaultSearchObjectDomain = buildSearchObjectDomain();

describe("createSearchObject", () => {
  const logger = getLogger();
  const tableName: string = uuid();

  const getSearchObjectFn = makeGetSearchObject(client, tableName);
  const createSearchObjectFn = makeCreateSearchObject(client, tableName);

  beforeEach(async () => {
    await preparesGenericTable(tableName);
  });

  it("can searchObject, if nonexistent", async () => {
    const newSearchObject = buildSearchObjectDomain();

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

    const newSearchObject = buildSearchObjectDomain({
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
