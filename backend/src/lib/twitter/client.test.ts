import { Client, searchRecent } from "./client";
import {
  GetUserResponse,
  SearchRecentResponse,
  SearchRecentResponseItem,
} from "./models";
import { PartialDeep } from "type-fest";
import { buildTwitterSearchResult } from "../../../test/lib/builders";
import { deepmergeSafe } from "@diogovasconcelos/lib/deepmerge";
import { fromEither } from "@diogovasconcelos/lib/iots";
import { getLogger } from "../logger";

const logger = getLogger();

const twitterClient = { request: jest.fn() } as unknown as Client;
const requestMock = twitterClient.request as jest.MockedFunction<
  Client["request"]
>;

describe("twitter", () => {
  it("can paginate", async () => {
    const twitterResponse0 = makeTwitterResponse();
    const twitterResponse1 = makeTwitterResponse({
      partialData: {
        id: "other-id",
        text: "another-text",
      },
      partialMeta: {
        next_token: undefined,
      },
    });
    const getUserResponse: GetUserResponse = {
      data: {
        id: "id",
        name: "name",
        username: "username",
        public_metrics: {
          followers_count: 0,
          following_count: 0,
          tweet_count: 0,
          listed_count: 0,
        },
      },
    };

    requestMock
      .mockResolvedValueOnce({
        status: 200,
        data: twitterResponse0,
      })
      .mockResolvedValueOnce({
        status: 200,
        data: getUserResponse,
      })
      .mockResolvedValueOnce({
        status: 200,
        data: twitterResponse1,
      })
      .mockResolvedValueOnce({
        status: 200,
        data: getUserResponse,
      });

    const searchResult = fromEither(
      await searchRecent({ client: twitterClient, logger }, "keyword")
    );

    expect(searchResult).toEqual([
      ...twitterResponse0.data.map((item) => ({ ...item, followers_count: 0 })),
      ...twitterResponse1.data.map((item) => ({ ...item, followers_count: 0 })),
    ]);
  });
});

const makeTwitterResponse = ({
  partialData,
  partialMeta,
}: {
  partialData?: PartialDeep<SearchRecentResponseItem>;
  partialMeta?: PartialDeep<SearchRecentResponse["meta"]>;
} = {}): SearchRecentResponse => {
  return {
    data: [deepmergeSafe(buildTwitterSearchResult().data, partialData ?? {})],
    meta: deepmergeSafe(
      {
        result_count: 1,
        next_token: "next-token-id",
        newest_id: "newest_id",
        oldest_id: "oldest_id",
      },
      partialMeta ?? {}
    ),
  };
};
