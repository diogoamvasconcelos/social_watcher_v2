import { HackernewsSearchResult } from "../../../domain/models/searchResult";
import { SearchSocialMediaFn } from "../shared";

export type SearchHackernewsFn = SearchSocialMediaFn<HackernewsSearchResult>;
