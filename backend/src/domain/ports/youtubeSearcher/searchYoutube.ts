import { YoutubeSearchResult } from "@src/domain/models/searchResult";
import { SearchSocialMediaFn } from "@src/domain/ports/shared";

export type SearchYoutubeFn = SearchSocialMediaFn<YoutubeSearchResult>;
