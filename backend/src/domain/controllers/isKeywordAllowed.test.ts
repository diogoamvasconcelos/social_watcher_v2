import { right } from "fp-ts/lib/Either";
import { getLogger } from "../../lib/logger";
import { GetSearchObjectsForUserFn } from "../ports/userStore/getSearchObjectsForUser";
import { isKeywordAllowed } from "./isKeywordAllowed";
import { SearchObjectDomain } from "../models/userItem";
import {
  fromEither,
  newLowerCase,
  newPositiveInteger,
} from "@diogovasconcelos/lib/iots";

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
    type: "SEARCH_OBJECT",
    id: userId,
    index: newPositiveInteger(0),
    lockedStatus: "UNLOCKED",
    keyword,
    searchData: {
      twitter: { enabledStatus: "ENABLED" },
      reddit: { enabledStatus: "DISABLED", over18: false },
      hackernews: { enabledStatus: "DISABLED" },
    },
    notificationData: {
      discordNotification: {
        enabledStatus: "ENABLED",
        channel: "discord-channel",
        bot: {
          credentials: {
            token: "discord-bot-token",
          },
        },
      },
      slackNotification: {
        enabledStatus: "DISABLED",
        channel: "",
        bot: {
          credentials: {
            token: "slack-bot-token",
          },
        },
      },
    },
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
