import { getLogger } from "@src/lib/logger";
import { uuid } from "@src/lib/uuid";
import { client, preparesGenericTable } from "@test/lib/dynamoDb";
import { fromEither } from "@diogovasconcelos/lib/iots";
import { isLeft } from "fp-ts/lib/Either";
import { directlyPutUserItemInTable } from "./shared";
import { makeGetResultTagsForUser } from "@src/adapters/userStore/getResultTagsForUser";
import { makeDeleteResultTag } from "@src/adapters/userStore/deleteResultTag";
import { buildResultTag } from "@test/lib/builders";

jest.setTimeout(45000);

describe("deleteResultTag", () => {
  const logger = getLogger();
  const tableName: string = uuid();

  const getResultTagsForUserFn = makeGetResultTagsForUser(client, tableName);
  const deleteResultTagFn = makeDeleteResultTag(client, tableName);

  beforeEach(async () => {
    await preparesGenericTable(tableName);
  });

  it("deletes ResultTag, if existent", async () => {
    const initialResultTag = buildResultTag();
    await directlyPutUserItemInTable(logger, {
      tableName,
      userItem: initialResultTag,
    });

    const deleteResult = fromEither(
      await deleteResultTagFn(logger, initialResultTag)
    );

    const getResult = fromEither(
      await getResultTagsForUserFn(logger, initialResultTag.id)
    );

    expect(deleteResult).toEqual("OK");
    expect(getResult).not.toContain(initialResultTag);
  });

  it("can't delete nonexistent resultTag", async () => {
    const deleteResult = await deleteResultTagFn(logger, buildResultTag());

    expect(isLeft(deleteResult)).toBeTruthy();
  });
});
