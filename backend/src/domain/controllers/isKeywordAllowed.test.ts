import { right } from "fp-ts/lib/Either";
import {
  fromEither,
  newLowerCase,
  newPositiveInteger,
} from "@diogovasconcelos/lib";
import { getLogger } from "../../lib/logger";
import { SearchObject } from "../models/userItem";
import { GetSearchObjectsForUserFn } from "../ports/userStore/getSearchObjectsForUser";
import { isKeywordAllowed } from "./isKeywordAllowed";

const logger = getLogger();
const getSearchObjectsForUserFnMocked = jest.fn() as jest.MockedFunction<GetSearchObjectsForUserFn>;

describe("controllers/isKeywordAllowed", () => {
  beforeEach(() => {
    getSearchObjectsForUserFnMocked.mockReset();
  });

  const userId = "my-user-id";
  const keyword = newLowerCase("my-keyword");
  const defaultSearchObject: SearchObject = {
    type: "SEARCH_OBJECT",
    id: userId,
    index: newPositiveInteger(0),
    lockedStatus: "UNLOCKED",
    keyword,
    searchData: { twitter: { enabledStatus: "ENABLED" } },
  };

  const testCases: [string, SearchObject[], boolean][] = [
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
      returnedSearchObjects: SearchObject[],
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
