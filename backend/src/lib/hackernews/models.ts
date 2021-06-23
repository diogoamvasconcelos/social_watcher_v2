import { optionalNull } from "@diogovasconcelos/lib";
import * as t from "io-ts";

export const searchHNResponseItemCodec = t.type({
  author: t.string,
  objectID: t.string,
  created_at: t.string,
  title: optionalNull(t.string),
  points: optionalNull(t.number), // root / title have points
  num_comments: optionalNull(t.number), // root / title have comments
  comment_text: optionalNull(t.string),
  story_text: optionalNull(t.string), // the root "text"
  story_title: optionalNull(t.string), // the root "title"
  story_id: optionalNull(t.number), // the root "id"
  parent_id: optionalNull(t.number), // parent comment or root
});

export const searchHNResponseCodec = t.type({
  hits: t.array(searchHNResponseItemCodec),
  page: t.number,
  nbPages: t.number,
});
export type SearchHNResponse = t.TypeOf<typeof searchHNResponseCodec>;
