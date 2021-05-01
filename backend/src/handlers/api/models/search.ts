import * as t from "io-ts";
import { keywordCodec } from "../../../domain/models/keyword";
import {
  paginationRequestCodec,
  searchSearchResultsResultCodec,
} from "../../../domain/ports/searchResultsSearchEngine/searchSearchResults";
import { ApiBaseErrorCode, ApiRequestMetadata } from "./models";

export const searchRequestUserDataCodec = t.exact(
  t.intersection([
    t.type({
      keyword: keywordCodec,
    }),
    t.partial({
      dataQuery: t.string,
      pagination: paginationRequestCodec,
    }),
  ])
);
export type SearchRequestUserData = t.TypeOf<typeof searchRequestUserDataCodec>;

export const searchResponseCodec = searchSearchResultsResultCodec;
export type SearchResponse = t.TypeOf<typeof searchResponseCodec>;

export type SearchRequest = ApiRequestMetadata & SearchRequestUserData;
export type SearchErrorCode = ApiBaseErrorCode;
