import { InstagramSearchResult } from "@src/domain/models/searchResult";
import { SearchSocialMediaFn } from "@src/domain/ports/shared";

export type SearchInstagramFn = SearchSocialMediaFn<InstagramSearchResult>;
