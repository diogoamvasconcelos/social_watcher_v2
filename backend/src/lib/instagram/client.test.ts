import { scrapeTag } from "instagram-scraping";
import { getLogger } from "../logger";
import { getClient, search } from "./client";
import { fromEither } from "@diogovasconcelos/lib/iots";
import { InstagramMediaNode } from "./models";
import { uuid } from "../uuid";
import { getMinutesAgo, toUnixTimstamp, fromUnix } from "../date";
import _ from "lodash";
import "jest-extended";

jest.mock("instagram-scraping", () => ({
  ...jest.requireActual("../../adapters/userStore/putSearchObject"),
  scrapeTag: jest.fn(),
}));
const scrapeTagMock = scrapeTag as jest.MockedFunction<typeof scrapeTag>;

const logger = getLogger();

describe("instagram", () => {
  beforeEach(() => {
    scrapeTagMock.mockReset();
  });

  it("can handle empty nodes", async () => {
    scrapeTagMock.mockResolvedValueOnce({ total: 0, medias: [] });

    const client = await getClient("some-api-key");
    const result = fromEither(await search({ logger, client }, "test"));

    expect(result).toHaveLength(0);
  });

  it("sorts and removes extra older nodes", async () => {
    const nofMedias = 20;
    const minutesAgo = 100;

    scrapeTagMock.mockResolvedValueOnce({
      total: nofMedias,
      medias: _.range(nofMedias).map((_) => ({
        node: buildRandomMediaNode(minutesAgo),
      })),
    });

    const client = await getClient("some-api-key");
    const result = fromEither(
      await search({ logger, client }, "test", { maxResults: 10 })
    );

    expect(result).toHaveLength(10);
    for (let i = 0; i < result.length - 1; ++i) {
      expect(new Date(fromUnix(result[i].taken_at_timestamp))).toBeAfter(
        new Date(fromUnix(result[i + 1].taken_at_timestamp))
      );
    }
  });
});

const buildRandomMediaNode = (maxMinutesAgo: number): InstagramMediaNode => ({
  id: uuid().toString(),
  taken_at_timestamp: toUnixTimstamp(
    new Date(getMinutesAgo(_.random(0, maxMinutesAgo, true)))
  ),
  __typename: "GraphImage",
  owner: { id: "owner-id" },
  shortcode: "shortcode",
  comments_disabled: false,
  display_url: "display-url",
  edge_liked_by: { count: 0 },
  edge_media_to_comment: { count: 0 },
  edge_media_to_caption: { edges: [{ node: { text: "caption" } }] },
  is_video: false,
});
