import { right } from "fp-ts/lib/Either";
import { getLogger } from "@src/lib/logger";
import { GetSearchObjectsForUserFn } from "@src/domain/ports/userStore/getSearchObjectsForUser";
import { isKeywordAllowed } from "./isKeywordAllowed";
import { SearchObjectDomain } from "@src/domain/models/userItem";
import {
  fromEither,
  newLowerCase,
  newPositiveInteger,
} from "@diogovasconcelos/lib/iots";
import { defaultSearchObjectDataDomain } from "@test/lib/default";

const logger = getLogger();
const getSearchObjectsForUserFnMocked =
  jest.fn() as jest.MockedFunction<GetSearchObjectsForUserFn>;

describe("controllers/isKeywordAllowed", () => {
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
    "%p isKeyAllowed test",
    async (
      _title: string,
      returnedSearchObjects: SearchObjectDomain[],
      expectsAllowed: boolean
    ) => {
      getSearchObjectsForUserFnMocked.mockResolvedValueOnce(
        right(returnedSearchObjects)
      );

      const isAllowed = fromEither(
        await isKeywordAllowed(
          {
            logger,
            getSearchObjectsForUserFn: getSearchObjectsForUserFnMocked,
          },
          keyword,
          userId
        )
      );

      expect(isAllowed).toEqual(expectsAllowed);
    }
  );
});
