import { deepmergeSafe } from "@diogovasconcelos/lib";
import { fromEither } from "@diogovasconcelos/lib/iots";
import { buildRedditSearchResult } from "../../../test/lib/builders";
import { PartialDeep } from "type-fest";
import { getLogger } from "../logger";
import { Client, searchAll } from "./client";
import { SearchListing } from "./models";

const logger = getLogger();

describe("reddit", () => {
  const redditClient = {
    instance: { request: jest.fn() },
  } as unknown as Client;

  it("can handle empty listings", async () => {
    const redditResponse = {
      kind: "Listing",
      data: {
        after: null,
        dist: 0,
        children: [],
        before: null,
      },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    type AnyType = any;

    (
      redditClient.instance.request as jest.MockedFunction<AnyType>
    ).mockResolvedValueOnce({
      status: 200,
      data: redditResponse,
    });

    const searchResult = fromEither(
      await searchAll({ client: redditClient, logger }, "keyword")
    );

    expect(searchResult).toEqual([]);
  });

  it("can paginate", async () => {
    const redditResponse0 = makeRedditResponse({
      data: {
        after: "after-some",
      },
    });
    const redditResponse1 = makeRedditResponse({
      data: {
        after: undefined,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (redditClient.instance.request as jest.MockedFunction<any>)
      .mockResolvedValueOnce({
        status: 200,
        data: redditResponse0,
      })
      .mockResolvedValueOnce({
        status: 200,
        data: redditResponse1,
      });

    const searchResult = fromEither(
      await searchAll({ client: redditClient, logger }, "keyword")
    );

    expect(searchResult).toEqual([
      redditResponse0.data.children[0].data,
      redditResponse1.data.children[0].data,
    ]);
  });
});

const makeRedditResponse = (
  params?: PartialDeep<SearchListing>
): SearchListing => {
  return deepmergeSafe(
    {
      kind: "Listing",
      data: {
        dist: 0,
        children: [{ data: buildRedditSearchResult().data }],
      },
    },
    params ?? {}
  );
};
