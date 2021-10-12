import { getLogger } from "@src/lib/logger";
import { uuid } from "@src/lib/uuid";
import { client, preparesGenericTable } from "@test/lib/dynamoDb";
import { defaultResultTag } from "@test/lib/default";
import { deepmergeSafe } from "@diogovasconcelos/lib/deepmerge";
import { fromEither } from "@diogovasconcelos/lib/iots";
import { isLeft } from "fp-ts/lib/Either";
import { directlyPutUserItemInTable } from "./shared";
import { makeGetResultTagsForUser } from "@src/adapters/userStore/getResultTagsForUser";
import { makeCreateResultTag } from "@src/adapters/userStore/createResultTag";

jest.setTimeout(45000);

describe("createResultTag", () => {
  const logger = getLogger();
  const tableName: string = uuid();

  const getResultTagsForUserFn = makeGetResultTagsForUser(client, tableName);
  const createResultTagFn = makeCreateResultTag(client, tableName);

  beforeEach(async () => {
    await preparesGenericTable(tableName);
  });

  it("creates ResultTag, if nonexistent", async () => {
    const newResultTag = deepmergeSafe(defaultResultTag, {
      id: uuid(),
    });

    const createResult = fromEither(
      await createResultTagFn(logger, newResultTag)
    );

    const getResult = fromEither(
      await getResultTagsForUserFn(logger, newResultTag.id)
    );

    expect(createResult).toEqual(newResultTag);
    expect(getResult).toEqual([newResultTag]);
  });

  it("can't create resultTag if already exists", async () => {
    const initialResultTag = defaultResultTag;
    await directlyPutUserItemInTable(logger, {
      tableName,
      userItem: initialResultTag,
    });

    const newSearchObject = deepmergeSafe(defaultResultTag, {
      id: initialResultTag.id,
      tagId: initialResultTag.tagId,
    });

    const createResultEither = await createResultTagFn(logger, newSearchObject);

    const getResult = fromEither(
      await getResultTagsForUserFn(logger, initialResultTag.id)
    );

    expect(isLeft(createResultEither)).toBeTruthy();
    expect(getResult).toEqual([initialResultTag]);
  });
});
