import { Either, isLeft, left } from "fp-ts/lib/Either";
import { Logger } from "@src/lib/logger";
import { Client as SSMClient, getParameter } from "@src/lib/ssm";
import { Keyword } from "@src/domain/models/keyword";
import {
  InstagramSearchResult,
  toUniqueId,
} from "@src/domain/models/searchResult";
import { fromUnix } from "@src/lib/date";
import {
  instagramApiKeyCodec,
  InstagramMediaNode,
} from "@src/lib/instagram/models";
import {
  getClient as getInstagramClient,
  Client as InstagramClient,
} from "@src/lib/instagram/client";
import { decode } from "@diogovasconcelos/lib/iots";

export const getClient = getInstagramClient;
export type Client = InstagramClient;

export const getClientAPIKey = async (
  ssmClient: SSMClient,
  logger: Logger
): Promise<Either<string, string>> => {
  const result = await getParameter(
    ssmClient,
    { Name: "rapidapi_keys", WithDecryption: true },
    (value: string) => {
      return decode(instagramApiKeyCodec, value);
    },
    logger
  );
  if (isLeft(result) || result.right.length == 0) {
    return left("Failed to retrieve RapidAPI key (for Instagram)");
  }

  return result;
};

export const outToDomain = (
  keyword: Keyword,
  out: InstagramMediaNode
): InstagramSearchResult => {
  const socialMedia = "instagram";
  const localId = out.id;
  return {
    id: toUniqueId({ socialMedia, localId }),
    socialMedia,
    localId,
    keyword,
    happenedAt: fromUnix(out.taken_at_timestamp),
    data: {
      id: out.id,
      caption: out.edge_media_to_caption.edges
        .map((edge) => edge.node.text)
        .join("\n"),
      owner: out.owner.id,
      shortcode: out.shortcode,
      display_url: out.display_url,
      num_comments: out.edge_media_to_comment.count,
      num_likes: out.edge_liked_by.count,
      is_video: out.is_video,
      num_video_views: out.video_view_count,
    },
    link: `https://www.instagram.com/p/${out.shortcode}`,
  };
};
