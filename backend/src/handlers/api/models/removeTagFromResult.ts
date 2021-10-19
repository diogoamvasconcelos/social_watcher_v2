import * as t from "io-ts";
import {
  SearchResult,
  searchResultCodec,
} from "@src/domain/models/searchResult";
import { resultTagIdCodec } from "@src/domain/models/userItem";
import { ApiBaseErrorCode, ApiRequestMetadata } from "./models";

export const removeTagFromResultUserDataCodec = t.type({
  tagId: resultTagIdCodec,
});
export type RemoveTagFromResultUserData = t.TypeOf<
  typeof removeTagFromResultUserDataCodec
>;

export type RemoveTagFromResultRequest = ApiRequestMetadata & {
  searchResult: Pick<SearchResult, "id">;
  data: RemoveTagFromResultUserData;
};
export type RemoveTagFromResultErrorCode =
  | ApiBaseErrorCode
  | "SEARCH_RESULT_NOT_FOUND"
  | "RESULT_TAG_NOT_FOUND"
  | "TAG_MISSING_IN_RESULT";

export const removeTagFromResultResponseCodec = searchResultCodec;
export type RemoveTagFromResultResponse = t.TypeOf<
  typeof removeTagFromResultResponseCodec
>;
