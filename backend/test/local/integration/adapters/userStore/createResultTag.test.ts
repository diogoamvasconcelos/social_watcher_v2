import { getLogger } from "@src/lib/logger";
import { uuid } from "@src/lib/uuid";
import { client, preparesGenericTable } from "@test/lib/dynamoDb";
import { fromEither } from "@diogovasconcelos/lib/iots";
import { isLeft } from "fp-ts/lib/Either";
import { directlyPutUserItemInTable } from "./shared";
import { makeGetResultTagsForUser } from "@src/adapters/userStore/getResultTagsForUser";
import { makeCreateResultTag } from "@src/adapters/userStore/createResultTag";
import { buildResultTag } from "@test/lib/builders";

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
    const newResultTag = buildResultTag();

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
    const initialResultTag = buildResultTag();
    await directlyPutUserItemInTable(logger, {
      tableName,
      userItem: initialResultTag,
    });

    const newResultTag = buildResultTag({
      id: initialResultTag.id,
      tagId: initialResultTag.tagId,
    });

    const createResultTagEither = await createResultTagFn(logger, newResultTag);

    const getResult = fromEither(
      await getResultTagsForUserFn(logger, initialResultTag.id)
    );

    expect(isLeft(createResultTagEither)).toBeTruthy();
    expect(getResult).toEqual([initialResultTag]);
  });
});
