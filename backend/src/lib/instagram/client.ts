import { deepmergeSafe } from "@diogovasconcelos/lib/deepmerge";
import { decode } from "@diogovasconcelos/lib/iots";
import { Either, isLeft, left, right } from "fp-ts/lib/Either";
import { scrapeTag, ScrapeMediaNode } from "instagram-scraping";
import { fromUnix, getMinutesAgo } from "../date";
import { Logger } from "../logger";
import { InstagramMediaNode, instagramMediaNodeCodec } from "./models";

export type InstagramDependencies = {
  logger: Logger;
};

// ++++++++++
// + SEARCH +
// ++++++++++
// https://github.com/rzlyp/instagram-scraping

export type SearchParams = {
  maxResults: number;
  minutesAgo: number;
};

const defaultSearchRequestParams: SearchParams = {
  maxResults: 100,
  minutesAgo: 60 * 24 * 2, // 2 days
};

export const search = async (
  { logger }: InstagramDependencies,
  text: string,
  params?: Partial<SearchParams>
): Promise<Either<"ERROR", InstagramMediaNode[]>> => {
  const searchParams = deepmergeSafe(defaultSearchRequestParams, params ?? {});

  try {
    // tags can't have spaces, only characters, numbers and underscore
    const tag = text.replace(/[^a-zA-Z0-9_]/g, "");
    const tagRes = await scrapeTag(tag);
    // this does too many requests: expensive and blocked
    //     const deepTagRes = await ig.deepScrapeTagPage(text);

    // dedup and filter nodes
    const nodesMap = new Map<ScrapeMediaNode["id"], ScrapeMediaNode>();
    const filterTimestamp = getMinutesAgo(searchParams.minutesAgo);
    for (const media of [...tagRes.medias /*...deepTagRes.medias*/]) {
      if (fromUnix(media.node.taken_at_timestamp) < filterTimestamp) {
        continue;
      }

      nodesMap.set(media.node.id, media.node);
    }

    let nodesList = Array.from(nodesMap.values());
    // sort by most recent
    nodesList.sort((a, b) => {
      return a.taken_at_timestamp == b.taken_at_timestamp
        ? 0
        : a.taken_at_timestamp < b.taken_at_timestamp
        ? 1
        : -1;
    });
    // clamp to maxResults size
    nodesList = nodesList.slice(0, searchParams.maxResults);

    const nodesEither = nodesList.map((node) => {
      const res = decode(instagramMediaNodeCodec, node);
      if (isLeft(res)) {
        logger.error("instagram:search failed to decode node", {
          node: node,
          error: res.left,
        });
      }
      return res;
    });

    const nodesResult: InstagramMediaNode[] = [];
    for (const nodeEither of nodesEither) {
      if (isLeft(nodeEither)) {
        return left("ERROR");
      }
      nodesResult.push(nodeEither.right);
    }
    return right(nodesResult);
  } catch (error) {
    logger.error("instagra:search failed", { error });
    return left("ERROR");
  }
};
