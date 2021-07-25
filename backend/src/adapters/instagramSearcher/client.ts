import { Either, isLeft, left, right } from "fp-ts/lib/Either";
import { Logger } from "../../lib/logger";
import { Client as SSMClient, getParameter } from "../../lib/ssm";
import { Keyword } from "../../domain/models/keyword";
import { InstagramSearchResult } from "../../domain/models/searchResult";
import { fromUnix } from "../../lib/date";
import { InstagramMediaNode } from "../../lib/instagram/models";

export const ensureAPIKeyInEnv = async (
  ssmClient: SSMClient,
  logger: Logger
): Promise<Either<string, string>> => {
  const result = await getParameter(
    ssmClient,
    { Name: "rapidapi_keys", WithDecryption: true },
    (value: string) => right(value),
    logger
  );
  if (isLeft(result) || result.right.length == 0) {
    return left("Failed to retrieve RapidAPI key (for Instagram)");
  }

  process.env["RAPIDAPI_KEY"] = result.right;
  return result;
};

export const outToDomain = (
  keyword: Keyword,
  out: InstagramMediaNode
): InstagramSearchResult => ({
  socialMedia: "instagram",
  id: out.id,
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
});
