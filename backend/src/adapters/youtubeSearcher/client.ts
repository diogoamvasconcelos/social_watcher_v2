import { Client as SSMClient, getParameter } from "../../lib/ssm";
import { Logger } from "../../lib/logger";
import { decode, newNumberFromStringy } from "@diogovasconcelos/lib/iots";
import {
  youtubeCredentialsCodec,
  YoutubeVideosResponseItem,
} from "../../lib/youtube/models";
import { isLeft } from "fp-ts/lib/Either";
import {
  getClient as getYoutubeClient,
  Client as YoutubeClient,
} from "../../lib/youtube/client";
import { Keyword } from "../../domain/models/keyword";
import { YoutubeSearchResult } from "../../domain/models/searchResult";
import { iso8061DurationToSeconds } from "../../lib/date";

export const getClient = getYoutubeClient;
export type Client = YoutubeClient;

export const getClientCredentials = async (
  ssmClient: SSMClient,
  logger: Logger
) => {
  const result = await getParameter(
    ssmClient,
    { Name: "youtube_keys", WithDecryption: true },
    (value: string) => {
      return decode(youtubeCredentialsCodec, JSON.parse(value));
    },
    logger
  );
  if (isLeft(result) || typeof result.right == "string") {
    throw new Error("Failed to retrieve Youtube Credentials");
  }

  return result.right;
};

export const outToDomain = (
  keyword: Keyword,
  out: YoutubeVideosResponseItem
): YoutubeSearchResult => ({
  socialMedia: "youtube",
  id: out.id,
  keyword,
  happenedAt: out.snippet.publishedAt,
  data: {
    id: out.id,
    title: out.snippet.title,
    description: out.snippet.description,
    thumbnailUrl: out.snippet.thumbnails.medium.url,
    viewCount: out.statistics.viewCount,
    likeCount: out.statistics.likeCount,
    dislikeCount: out.statistics.dislikeCount,
    favoriteCount: out.statistics.favoriteCount,
    commentCount: out.statistics.commentCount ?? newNumberFromStringy("0"),
    durationInSeconds: iso8061DurationToSeconds(out.contentDetails.duration),
  },
  link: `https://www.youtube.com/watch?v=${out.id}`,
});
