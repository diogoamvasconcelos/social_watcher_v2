import { newLowerCase } from "@diogovasconcelos/lib/iots";
import { fromUnix, toUnixTimstamp } from "../../lib/date";
import { InstagramMediaNode } from "../../lib/instagram/models";
import { outToDomain } from "./client";

describe("instagramSearcher client", () => {
  describe("outToDomain", () => {
    it("can convert successfully", () => {
      const keyword = newLowerCase("test-keyword");
      const out: InstagramMediaNode = {
        __typename: "GraphImage",
        id: "id",
        owner: {
          id: "owner-id",
          username: "owner-username",
        },
        shortcode: "shortcode",
        comments_disabled: true,
        taken_at_timestamp: toUnixTimstamp(new Date()),
        display_url: "display-url",
        edge_liked_by: { count: 1 },
        edge_media_to_comment: { count: 2 },
        edge_media_to_caption: {
          edges: [
            { node: { text: "caption #1" } },
            { node: { text: "another caption#2" } },
          ],
        },
        is_video: false,
      };

      const domain = outToDomain(keyword, out);

      expect(domain.happenedAt).toEqual(fromUnix(out.taken_at_timestamp));
      expect(domain.data.num_likes).toEqual(out.edge_liked_by.count);
      expect(domain.data.num_comments).toEqual(out.edge_media_to_comment.count);
      expect(domain.data.caption).toEqual("caption #1\nanother caption#2");
    });
  });
});
