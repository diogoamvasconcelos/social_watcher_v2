import { HackernewsSearchResult } from "@src/domain/models/searchResult";
import { SearchSocialMediaFn } from "@src/domain/ports/shared";

export type SearchHackernewsFn = SearchSocialMediaFn<HackernewsSearchResult>;
