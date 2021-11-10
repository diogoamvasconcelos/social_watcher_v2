import { Client as SSMClient, getParameter } from "@src/lib/ssm";
import { Logger } from "@src/lib/logger";
import { decode, newNumberFromStringy } from "@diogovasconcelos/lib/iots";
import {
  youtubeCredentialsCodec,
  YoutubeVideosResponseItem,
} from "@src/lib/youtube/models";
import { isLeft } from "fp-ts/lib/Either";
import {
  getClient as getYoutubeClient,
  Client as YoutubeClient,
} from "@src/lib/youtube/client";
import { Keyword } from "@src/domain/models/keyword";
import {
  toUniqueId,
  YoutubeSearchResult,
} from "@src/domain/models/searchResult";
import { iso8061DurationToSeconds } from "@src/lib/date";

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
): YoutubeSearchResult => {
  const socialMedia = "youtube";
  const localId = out.id;
  return {
    id: toUniqueId({ socialMedia, localId }),
    socialMedia,
    localId,
    keyword,
    happenedAt: out.snippet.publishedAt,
    data: {
      id: out.id,
      title: out.snippet.title,
      description: out.snippet.description,
      thumbnailUrl: out.snippet.thumbnails.medium.url,
      viewCount: out.statistics.viewCount,
      likeCount: out.statistics.likeCount,
      favoriteCount: out.statistics.favoriteCount,
      commentCount: out.statistics.commentCount ?? newNumberFromStringy("0"),
      durationInSeconds: iso8061DurationToSeconds(out.contentDetails.duration),
    },
    link: `https://www.youtube.com/watch?v=${out.id}`,
  };
};
