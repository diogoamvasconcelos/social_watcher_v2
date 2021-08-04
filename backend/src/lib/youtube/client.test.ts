import { deepmergeSafe } from "@diogovasconcelos/lib/deepmerge";
import { fromEither, newNumberFromStringy } from "@diogovasconcelos/lib/iots";
import { PartialDeep } from "type-fest";
import { getNow } from "../date";
import { getLogger } from "../logger";
import { uuid } from "../uuid";
import { Client, search } from "./client";
import { YoutubeSearchResponse, YoutubeVideosResponse } from "./models";

const logger = getLogger();

const youtubeClient = {
  instance: { request: jest.fn() },
  credentials: { apiKey: "some-key" },
} as unknown as Client;

const requestMock = youtubeClient.instance.request as jest.MockedFunction<
  Client["instance"]["request"]
>;

describe("youtube", () => {
  beforeEach(() => {
    requestMock.mockReset();
  });

  it("can handle empty listings", async () => {
    const searchResponse: YoutubeSearchResponse = makeYoutubeSearchResponse();
    searchResponse.items = [];

    requestMock.mockResolvedValueOnce({
      status: 200,
      data: searchResponse,
    });

    const searchResult = fromEither(
      await search({ client: youtubeClient, logger }, "keyword")
    );

    expect(searchResult).toEqual([]);
  });

  it("can paginate", async () => {
    const searchResponse0 = makeYoutubeSearchResponse({
      nextPageToken: "some-page-token",
    });
    const videosResponse0 = makeYoutubeVideosResponse();
    const searchResponse1 = makeYoutubeSearchResponse();
    const videosResponse1 = makeYoutubeVideosResponse();

    requestMock
      .mockResolvedValueOnce({
        status: 200,
        data: searchResponse0,
      })
      .mockResolvedValueOnce({
        status: 200,
        data: videosResponse0,
      })
      .mockResolvedValueOnce({
        status: 200,
        data: searchResponse1,
      })
      .mockResolvedValueOnce({
        status: 200,
        data: videosResponse1,
      });

    const searchResult = fromEither(
      await search({ client: youtubeClient, logger }, "keyword")
    );

    expect(searchResult).toEqual([
      videosResponse0.items[0],
      videosResponse1.items[0],
    ]);
  });
});

const makeYoutubeSearchResponse = (
  params?: PartialDeep<YoutubeSearchResponse>
): YoutubeSearchResponse => {
  return deepmergeSafe(
    {
      pageInfo: {
        totalResults: 1,
        resultsPerPage: 1,
      },
      items: [
        {
          id: {
            kind: "youtube#video",
            videoId: uuid(),
          },
          snippet: {
            publishedAt: getNow(),
            channelId: "channel-id",
            channelTitle: "channel-title",
            title: "title",
            description: "decription",
            thumbnails: {
              default: {
                url: "tn-default-url",
              },
              medium: {
                url: "tn-medium-url",
              },
              high: {
                url: "tn-high-url",
              },
            },
          },
        },
      ],
    },
    params ?? {}
  );
};

const makeYoutubeVideosResponse = (
  params?: PartialDeep<YoutubeVideosResponse>
): YoutubeVideosResponse => {
  return deepmergeSafe(
    {
      pageInfo: {
        totalResults: 1,
        resultsPerPage: 1,
      },
      items: [
        {
          id: "videoId",
          snippet: {
            publishedAt: getNow(),
            channelId: "channel-id",
            channelTitle: "channel-title",
            title: "title",
            description: "decription",
            thumbnails: {
              default: {
                url: "tn-default-url",
              },
              medium: {
                url: "tn-medium-url",
              },
              high: {
                url: "tn-high-url",
              },
            },
          },
          contentDetails: {
            duration: "0s",
            caption: "caption",
          },
          statistics: {
            viewCount: newNumberFromStringy("0"),
            likeCount: newNumberFromStringy("0"),
            dislikeCount: newNumberFromStringy("0"),
            favoriteCount: newNumberFromStringy("0"),
            commentCount: newNumberFromStringy("0"),
          },
        },
      ],
    },
    params ?? {}
  );
};
