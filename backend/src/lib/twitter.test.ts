/* eslint-disable @typescript-eslint/no-explicit-any */
import deepmerge from "deepmerge";
import { fromEither } from "./iots";
import { Client, searchRecent, SearchRecentResponse } from "./twitter";

describe("twitter", () => {
  const twitterClient = ({ request: jest.fn() } as unknown) as Client;

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

    (twitterClient.request as jest.MockedFunction<any>)
      .mockResolvedValueOnce({
        status: 200,
        data: twitterResponse0,
      })
      .mockResolvedValueOnce({
        status: 200,
        data: twitterResponse1,
      });

    const searchResult = fromEither(
      await searchRecent(twitterClient, "keyword")
    );

    expect(searchResult).toEqual([
      ...toTwitterResult(twitterResponse0.data),
      ...toTwitterResult(twitterResponse1.data),
    ]);
  });
});

const makeTwitterResponse = ({
  partialData,
  partialMeta,
}: {
  partialData?: Partial<SearchRecentResponse["data"][0]>;
  partialMeta?: Partial<SearchRecentResponse["meta"]>;
} = {}) => {
  return {
    data: [
      deepmerge(
        {
          id: "some-id",
          text: "some-text",
          created_at: new Date(Date.now()).toISOString(),
          conversation_id: "conversation#0",
          author_id: "author#0",
          lang: "en",
        },
        partialData ?? {}
      ),
    ],
    meta: deepmerge(
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

const toTwitterResult = (
  twitterResponse: ReturnType<typeof makeTwitterResponse>["data"]
) => {
  return twitterResponse.map((item) => ({
    ...item,
    created_at: new Date(item.created_at),
  }));
};
