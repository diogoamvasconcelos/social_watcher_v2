import { RedditSearchResult } from "@src/domain/models/searchResult";
import { SearchSocialMediaFn } from "@src/domain/ports/shared";

export type SearchRedditFn = SearchSocialMediaFn<RedditSearchResult>;
