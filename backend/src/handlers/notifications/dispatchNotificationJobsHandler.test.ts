import { defaultSearchObjectDomain } from "@test/lib/default";
import {
  buildHackernewsSearchResult,
  buildRedditSearchResult,
  buildSQSEvent,
  buildTwitterSearchResult,
} from "@test/lib/builders";
import { makeGetSearchObjectsForKeyword } from "@src/adapters/userStore/getSearchObjectsForKeyword";
import { makeQueueNotificationJobs } from "@src/adapters/notificationJobsQueue/queueNotificationJobs";
import { right } from "fp-ts/lib/Either";
import { handler } from "./dispatchNotificationJobsHandler";
import { fromEither } from "@diogovasconcelos/lib/iots";
import { deepmergeSafe } from "@diogovasconcelos/lib/deepmerge";
import { SearchObjectDomain } from "@src/domain/models/userItem";
import { SearchResult } from "@src/domain/models/searchResult";

// mock: getSearchObjectsForKeyword
jest.mock("@src/adapters/userStore/getSearchObjectsForKeyword", () => ({
  ...jest.requireActual("@src/adapters/userStore/getSearchObjectsForKeyword"),
  makeGetSearchObjectsForKeyword: jest.fn(),
}));
const makeGetSearchObjectsForKeywordMock =
  makeGetSearchObjectsForKeyword as jest.MockedFunction<
    typeof makeGetSearchObjectsForKeyword
  >;
const getSearchObjectsForKeywordMock = jest.fn();
makeGetSearchObjectsForKeywordMock.mockReturnValue(
  getSearchObjectsForKeywordMock
);

// mock: makeQueueNotificationJobs
jest.mock("@src/adapters/notificationJobsQueue/queueNotificationJobs", () => ({
  ...jest.requireActual(
    "@src/adapters/notificationJobsQueue/queueNotificationJobs"
  ),
  makeQueueNotificationJobs: jest.fn(),
}));
const makeQueueNotificationJobsMock =
  makeQueueNotificationJobs as jest.MockedFunction<
    typeof makeQueueNotificationJobs
  >;
const queueNotificationJobsMock = jest.fn().mockResolvedValue(right("OK"));
makeQueueNotificationJobsMock.mockReturnValue(queueNotificationJobsMock);

describe("handlers/dispatchNotificationJobs", () => {
  beforeEach(() => {
    getSearchObjectsForKeywordMock.mockReset();
  });

  it("dispatchs notificationJobs for notificationMediums of same user", async () => {
    const searchObject: SearchObjectDomain = deepmergeSafe(
      defaultSearchObjectDomain,
      {
        id: "userA",
        notificationData: {
          discord: {
            enabledStatus: "ENABLED",
            bot: {
              credentials: {
                token: "tokenDiscord",
              },
            },
            channel: "channelDiscord",
          },
          slack: {
            enabledStatus: "ENABLED",
            bot: {
              credentials: {
                token: "tokenSlack",
              },
            },
            channel: "channelSlack",
          },
        },
      }
    );

    getSearchObjectsForKeywordMock.mockResolvedValueOnce(right([searchObject]));

    const sqsEvent = buildSQSEvent([
      buildTwitterSearchResult({ keyword: searchObject.keyword }),
    ]);

    const response = fromEither(await handler(sqsEvent));

    expect(response).toEqual("OK");
    expect(queueNotificationJobsMock).toHaveBeenNthCalledWith(
      1,
      expect.anything(),
      "discord",
      [
        expect.objectContaining({
          config: searchObject.notificationData.discord,
        }),
      ]
    );
    expect(queueNotificationJobsMock).toHaveBeenNthCalledWith(
      2,
      expect.anything(),
      "slack",
      [
        expect.objectContaining({
          config: searchObject.notificationData.slack,
        }),
      ]
    );
  });

  it("dispatchs notificationJobs for multiple users", async () => {
    const searchObjectsForUsers: SearchObjectDomain[] = [
      deepmergeSafe(defaultSearchObjectDomain, {
        id: "userA",
        notificationData: {
          discord: {
            enabledStatus: "ENABLED",
            bot: {
              credentials: {
                token: "tokenA",
              },
            },
            channel: "channelA",
          },
        },
      }),
      deepmergeSafe(defaultSearchObjectDomain, {
        id: "userB",
        notificationData: {
          discord: {
            enabledStatus: "ENABLED",
            bot: {
              credentials: {
                token: "tokenB",
              },
            },
            channel: "channelB",
          },
        },
      }),
    ];

    getSearchObjectsForKeywordMock.mockResolvedValueOnce(
      right(searchObjectsForUsers)
    );

    const sqsEvent = buildSQSEvent([
      buildTwitterSearchResult({ keyword: defaultSearchObjectDomain.keyword }),
    ]);

    const response = fromEither(await handler(sqsEvent));

    expect(response).toEqual("OK");
    expect(queueNotificationJobsMock).toBeCalledWith(
      expect.anything(),
      "discord",
      searchObjectsForUsers.map((searchObject) =>
        expect.objectContaining({
          config: searchObject.notificationData.discord,
        })
      )
    );
  });

  describe("filters out searchObjects that incompatible with searchResult", () => {
    const testCases: [string, SearchResult, SearchObjectDomain, boolean][] = [
      [
        "twitter not enabled",
        buildTwitterSearchResult(),
        deepmergeSafe(defaultSearchObjectDomain, {
          searchData: {
            twitter: {
              enabledStatus: "DISABLED",
            },
          },
        }),
        false,
      ],
      [
        "reddit over18 disabled",
        buildRedditSearchResult({ data: { over_18: true } }),
        deepmergeSafe(defaultSearchObjectDomain, {
          searchData: {
            reddit: {
              enabledStatus: "ENABLED",
              over18: false,
            },
          },
        }),
        false,
      ],
      [
        "reddit over18 is queued",
        buildRedditSearchResult({ data: { over_18: true } }),
        deepmergeSafe(defaultSearchObjectDomain, {
          searchData: {
            reddit: {
              enabledStatus: "ENABLED",
              over18: true,
            },
          },
        }),
        true,
      ],
      [
        "hackernews fuzzy match",
        buildHackernewsSearchResult({ data: { fuzzyMatch: true } }),
        deepmergeSafe(defaultSearchObjectDomain, {
          searchData: {
            hackernews: {
              enabledStatus: "ENABLED",
              fuzzyMatch: false,
            },
          },
        }),
        false,
      ],
    ];

    test.each(testCases)(
      "%p isKeyAllowed test",
      async (
        _title: string,
        eventsSearchResult: SearchResult,
        returnedSearchObject: SearchObjectDomain,
        queued: boolean
      ) => {
        getSearchObjectsForKeywordMock.mockResolvedValueOnce(
          right([returnedSearchObject])
        );

        const sqsEvent = buildSQSEvent([eventsSearchResult]);
        const response = fromEither(await handler(sqsEvent));
        expect(response).toEqual("OK");

        if (queued) {
          expect(queueNotificationJobsMock).toBeCalled();
        } else {
          expect(queueNotificationJobsMock).not.toBeCalled();
        }
      }
    );
  });
});
