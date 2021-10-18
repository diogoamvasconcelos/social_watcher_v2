import * as t from "io-ts";
import {
  SearchResult,
  searchResultCodec,
} from "@src/domain/models/searchResult";
import { resultTagIdCodec } from "@src/domain/models/userItem";
import { ApiBaseErrorCode, ApiRequestMetadata } from "./models";

export const addTagToResultUserDataCodec = t.type({
  tagId: resultTagIdCodec,
});
export type AddTagToResultUserData = t.TypeOf<
  typeof addTagToResultUserDataCodec
>;

export type AddTagToResultRequest = ApiRequestMetadata & {
  searchResult: Pick<SearchResult, "id">;
  data: AddTagToResultUserData;
};
export type AddTagToResultErrorCode =
  | ApiBaseErrorCode
  | "SEARCH_RESULT_NOT_FOUND"
  | "RESULT_TAG_NOT_FOUND"
  | "TAG_ALREADY_ADDED";

export const addTagToResultResponseCodec = searchResultCodec;
export type AddTagToResultResponse = t.TypeOf<
  typeof addTagToResultResponseCodec
>;
