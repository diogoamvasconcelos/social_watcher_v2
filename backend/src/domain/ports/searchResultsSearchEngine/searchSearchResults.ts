import { DateISOString, positiveInteger } from "@diogovasconcelos/lib/iots";
import * as t from "io-ts";
import { Logger } from "../../../lib/logger";
import { Keyword } from "../../models/keyword";
import { searchResultCodec } from "../../models/searchResult";
import { CustomRightReturn } from "../shared";

export const paginationRequestCodec = t.type({
  limit: positiveInteger,
  offset: positiveInteger,
});
export type PaginationRequest = t.TypeOf<typeof paginationRequestCodec>;

// omg, this name!!
export const searchSearchResultsResultCodec = t.type({
  items: t.array(searchResultCodec),
  pagination: t.type({
    limit: positiveInteger,
    offset: positiveInteger,
    count: positiveInteger,
    total: positiveInteger,
  }),
});
export type SearchSearchResultsResult = t.TypeOf<
  typeof searchSearchResultsResultCodec
>;

export type SearchSearchResultsParams = {
  keyword: Keyword;
  dataQuery?: string;
  pagination?: PaginationRequest;
  timeQuery?: {
    happenedAtStart?: DateISOString;
    happenedAtEnd?: DateISOString;
  };
};

export type SearchSearchResultsFn = (
  logger: Logger,
  searchParams: SearchSearchResultsParams
) => CustomRightReturn<SearchSearchResultsResult>;
