import { dateISOString, optionalNull } from "@diogovasconcelos/lib/iots";
import * as t from "io-ts";

export const searchHNResponseItemCodec = t.exact(
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
export type SearchHNResponseItem = t.TypeOf<typeof searchHNResponseItemCodec>;

export const searchHNResponseCodec = t.type({
  hits: t.array(searchHNResponseItemCodec),
  page: t.number,
  nbPages: t.number,
});
export type SearchHNResponse = t.TypeOf<typeof searchHNResponseCodec>;

export const getItemHNResponseCodec = t.exact(
  t.type({
    id: t.number,
    created_at: dateISOString,
    points: optionalNull(t.number),
  })
);
export type GetItemHNResponse = t.TypeOf<typeof getItemHNResponseCodec>;
