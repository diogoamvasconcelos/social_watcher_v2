import * as t from "io-ts";
import {
  SearchSearchResultParamsCodec,
  searchSearchResultsResultCodec,
} from "@src/domain/ports/searchResultsSearchEngine/searchSearchResults";
import { ApiBaseErrorCode, ApiRequestMetadata } from "./models";

export const searchRequestUserDataCodec = t.exact(
  SearchSearchResultParamsCodec
);
export type SearchRequestUserData = t.TypeOf<typeof searchRequestUserDataCodec>;

export const searchResponseCodec = searchSearchResultsResultCodec;
export type SearchResponse = t.TypeOf<typeof searchResponseCodec>;

export type SearchRequest = ApiRequestMetadata & SearchRequestUserData;
export type SearchErrorCode = ApiBaseErrorCode;
