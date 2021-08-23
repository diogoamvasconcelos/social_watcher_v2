import { dateISOString, optionalNull } from "@diogovasconcelos/lib/iots";
import * as t from "io-ts";

export const searchHackernewsResponseItemCodec = t.exact(
  t.type({
    author: t.string,
    objectID: t.string,
    created_at: dateISOString,
    title: optionalNull(t.string),
    points: optionalNull(t.number), // root / title have points
    num_comments: optionalNull(t.number), // root / title have comments
    comment_text: optionalNull(t.string),
    story_text: optionalNull(t.string), // the root "text"
    story_title: optionalNull(t.string), // the root "title"
    story_id: optionalNull(t.number), // the root "id"
    parent_id: optionalNull(t.number), // parent comment or root
  })
);
export type SearchHackernewsResponseItem = t.TypeOf<
  typeof searchHackernewsResponseItemCodec
>;

export const searchHackernewsResponseCodec = t.type({
  hits: t.array(searchHackernewsResponseItemCodec),
  page: t.number,
  nbPages: t.number,
});
export type SearchHackernewsResponse = t.TypeOf<
  typeof searchHackernewsResponseCodec
>;

export const searchHackernewsItemCodec = t.intersection([
  searchHackernewsResponseItemCodec,
  t.type({ fuzzy_match: t.boolean }),
]);
export type SearchHackernewsItem = t.TypeOf<typeof searchHackernewsItemCodec>;

export const getItemHackernewsResponseCodec = t.exact(
  t.intersection([
    t.type({
      id: t.number,
      created_at: dateISOString,
      points: optionalNull(t.number),
    }),
    t.partial({
      children: t.array(t.UnknownRecord),
    }),
  ])
);
export type GetItemHackernewsResponse = t.TypeOf<
  typeof getItemHackernewsResponseCodec
>;
