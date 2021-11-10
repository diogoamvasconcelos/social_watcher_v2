import { dateISOString, numberFromStringy } from "@diogovasconcelos/lib/iots";
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
    medium: t.type({
      url: t.string,
    }),
    high: t.type({
      url: t.string,
    }),
  }),
});

const baseListResponseCodec = t.intersection([
  t.type({
    pageInfo: t.type({
      totalResults: t.number,
      resultsPerPage: t.number,
    }),
  }),
  t.partial({
    nextPageToken: t.string,
    prevPageToken: t.string,
  }),
]);

export const youtubeSearchResponseItemCodec = t.exact(
  t.type({
    id: t.type({
      kind: t.literal("youtube#video"),
      videoId: t.string,
    }),
    //snippet: baseSnippetCodec,
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
    }),
    statistics: t.intersection([
      t.type({
        viewCount: numberFromStringy,
        likeCount: numberFromStringy,
        // dislikeCount: numberFromStringy, // made private by youtube: https://blog.youtube/news-and-events/update-to-youtube/
        favoriteCount: numberFromStringy,
      }),
      t.partial({
        commentCount: numberFromStringy,
      }),
    ]),
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
