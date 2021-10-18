import { right } from "fp-ts/lib/Either";
import { getLogger } from "@src/lib/logger";
import { GetSearchObjectsForUserFn } from "@src/domain/ports/userStore/getSearchObjectsForUser";
import { isUserUsingKeyword } from "./isUserUsingKeyword";
import { SearchObjectDomain } from "@src/domain/models/userItem";
import {
  fromEither,
  newLowerCase,
  newPositiveInteger,
} from "@diogovasconcelos/lib/iots";
import { getNow } from "@src/lib/date";
import { buildSearchObjectDataDomain } from "@test/lib/builders";

const logger = getLogger();

const defaultSearchObjectDataDomain = buildSearchObjectDataDomain();

const getSearchObjectsForUserFnMocked =
  jest.fn() as jest.MockedFunction<GetSearchObjectsForUserFn>;

describe("controllers/isUserUsingKeyword", () => {
  beforeEach(() => {
    getSearchObjectsForUserFnMocked.mockReset();
  });

  const userId = "my-user-id";
  const keyword = newLowerCase("my-keyword");
  const defaultSearchObject: SearchObjectDomain = {
    ...defaultSearchObjectDataDomain,
    type: "SEARCH_OBJECT",
    id: userId,
    index: newPositiveInteger(0),
    lockedStatus: "UNLOCKED",
    keyword,
    createdAt: getNow(),
  };

  const testCases: [string, SearchObjectDomain[], boolean][] = [
    ["unlocked search object", [defaultSearchObject], true],
    [
      "locked search object",
      [{ ...defaultSearchObject, lockedStatus: "LOCKED" }],
      false,
    ],
    ["no search objects", [], false],
    [
      "search objects don't have keyword",
      [
        {
          ...defaultSearchObject,
          keyword: newLowerCase("another-keyword"),
        },
      ],
      false,
    ],
    [
      "two search objects one locked, other unlocked",
      [{ ...defaultSearchObject, lockedStatus: "LOCKED" }, defaultSearchObject],
      true,
    ],
  ];

  test.each(testCases)(
    "%p isUserUsingKeyword test",
    async (
      _title: string,
      returnedSearchObjects: SearchObjectDomain[],
      expectsOutput: boolean
    ) => {
      getSearchObjectsForUserFnMocked.mockResolvedValueOnce(
        right(returnedSearchObjects)
      );

      const isUsing = fromEither(
        await isUserUsingKeyword(
          {
            logger,
            getSearchObjectsForUserFn: getSearchObjectsForUserFnMocked,
          },
          keyword,
          userId
        )
      );

      expect(isUsing).toEqual(expectsOutput);
    }
  );
});
