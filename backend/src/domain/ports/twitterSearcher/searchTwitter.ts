import { TwitterSearchResult } from "@src/domain/models/searchResult";
import { SearchSocialMediaFn } from "@src/domain/ports/shared";

export type SearchTwitterFn = SearchSocialMediaFn<TwitterSearchResult>;
