import * as t from "io-ts";

const edgeCountCodec = t.type({
  count: t.number,
});

export const instagramMediaNodeCodec = t.exact(
  t.intersection([
    t.type({
      __typename: t.union([
        t.literal("GraphImage"),
        t.literal("GraphSidecar"),
        t.literal("GraphVideo"),
      ]),
      id: t.string,
      owner: t.intersection([
        t.type({
          id: t.string,
        }),
        t.partial({
          username: t.string,
          full_name: t.string,
          profile_pic_url: t.string,
          is_private: t.boolean,
          edge_followed_by: edgeCountCodec,
        }),
      ]),
      shortcode: t.string,
      comments_disabled: t.boolean,
      taken_at_timestamp: t.number,
      display_url: t.string,
      edge_liked_by: edgeCountCodec,
      edge_media_to_comment: edgeCountCodec,
      edge_media_to_caption: t.type({
        edges: t.array(
          t.type({
            node: t.type({ text: t.string }),
          })
        ),
      }),
      is_video: t.boolean,
    }),
    t.partial({ video_view_count: t.number }),
  ])
);
export type InstagramMediaNode = t.TypeOf<typeof instagramMediaNodeCodec>;
