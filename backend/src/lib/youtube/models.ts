import { dateISOString } from "@diogovasconcelos/lib/iots";
import * as t from "io-ts";

export const youtubeCredentialsCodec = t.type({
  apiKey: t.string,
});
export type YoutubeCredentials = t.TypeOf<typeof youtubeCredentialsCodec>;

// ++++++++++
// + SEARCH +
// ++++++++++
// https://developers.google.com/youtube/v3/docs/search#resource

const baseSnippetCodec = t.type({
  publishedAt: dateISOString,
  channelId: t.string,
  channelTitle: t.string,
  title: t.string,
  description: t.string,
  thumbnails: t.type({
    default: t.type({
      url: t.string,
    }),
  }),
});

const baseListResponseCodec = t.type({
  pageInfo: t.type({
    totalResults: t.number,
    resultsPerPage: t.number,
  }),
  nextPageToken: t.string,
  prevPageToken: t.string,
});

export const youtubeSearchResponseItemCodec = t.exact(
  t.type({
    id: t.intersection([
      t.type({
        kind: t.union([
          t.literal("youtube#video"),
          t.literal("youtube#channel"),
          t.literal("youtube#playlist"),
        ]),
      }),
      t.partial({
        videoId: t.string,
        channelId: t.string,
        playlistId: t.string,
      }),
    ]),
    snippet: baseSnippetCodec,
  })
);
export type YoutubeSearchResponseItem = t.TypeOf<
  typeof youtubeSearchResponseItemCodec
>;

export const youtubeSearchResponseCodec = t.exact(
  t.intersection([
    baseListResponseCodec,
    t.type({
      items: t.array(youtubeSearchResponseItemCodec),
    }),
  ])
);
export type YoutubeSearchResponse = t.TypeOf<typeof youtubeSearchResponseCodec>;

// ++++++++++
// + VIDEOS +
// ++++++++++

export const youtubeVideosResponseItemCodec = t.exact(
  t.type({
    id: t.string,
    snippet: baseSnippetCodec,
    contentDetails: t.type({
      duration: t.string,
      caption: t.string,
    }),
    statistics: t.type({
      viewCount: t.number,
      likeCount: t.number,
      dislikeCount: t.number,
      favouriteCount: t.number,
      commentCount: t.number,
    }),
  })
);
export type YoutubeVideosResponseItem = t.TypeOf<
  typeof youtubeVideosResponseItemCodec
>;

export const youtubeVideosResponseCodec = t.exact(
  t.intersection([
    baseListResponseCodec,
    t.type({
      items: t.array(youtubeVideosResponseItemCodec),
    }),
  ])
);
export type YoutubeVideosResponse = t.TypeOf<typeof youtubeVideosResponseCodec>;
