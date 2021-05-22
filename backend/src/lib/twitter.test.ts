/* eslint-disable @typescript-eslint/no-explicit-any */
import { getNow } from "./date";
import { deepmergeSafe } from "@diogovasconcelos/lib";
import { fromEither } from "@diogovasconcelos/lib";
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
      ...twitterResponse0.data,
      ...twitterResponse1.data,
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
      deepmergeSafe(
        {
          id: "some-id",
          text: "some-text",
          created_at: getNow(),
          conversation_id: "conversation#0",
          author_id: "author#0",
          lang: "en",
        },
        partialData ?? {}
      ),
    ],
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
