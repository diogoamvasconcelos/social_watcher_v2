import { Client, searchRecent } from "./client";
import { SearchRecentResponse, SearchRecentResponseItem } from "./models";
import { PartialDeep } from "type-fest";
import { buildTwitterSearchResult } from "../../../test/lib/builders";
import { deepmergeSafe } from "@diogovasconcelos/lib/deepmerge";
import { fromEither } from "@diogovasconcelos/lib/iots";

describe("twitter", () => {
  const twitterClient = { request: jest.fn() } as unknown as Client;

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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
