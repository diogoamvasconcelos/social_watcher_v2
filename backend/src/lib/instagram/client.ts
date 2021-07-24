import { decode } from "@diogovasconcelos/lib/iots";
import { Either, isLeft, left, right } from "fp-ts/lib/Either";
import ig, { ScrapeMediaNode } from "instagram-scraping";
import { Logger } from "../logger";
import { InstagramMediaNode, instagramMediaNodeCodec } from "./models";

export type InstagramDependencies = {
  logger: Logger;
};

export const search = async (
  { logger }: InstagramDependencies,
  text: string
): Promise<Either<"ERROR", InstagramMediaNode[]>> => {
  try {
    const tagRes = await ig.scrapeTag(text);
    // this does too many requests: expensive and blocked
    //     const deepTagRes = await ig.deepScrapeTagPage(text);

    // dedup nodes
    const nodesMap = new Map<ScrapeMediaNode["id"], ScrapeMediaNode>();
    for (const media of [...tagRes.medias /*...deepTagRes.medias*/]) {
      nodesMap.set(media.node.id, media.node);
    }

    const nodesEither = Array.from(nodesMap.values()).map((node) => {
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
