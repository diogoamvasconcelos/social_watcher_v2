import * as t from "io-ts";
import {
  SearchResult,
  searchResultCodec,
} from "@src/domain/models/searchResult";
import { resultTagIdCodec } from "@src/domain/models/userItem";
import { ApiBaseErrorCode, ApiRequestMetadata } from "./models";

export const addTagToResultRequestDataCodec = t.type({
  tagId: resultTagIdCodec,
});
export type AddTagToResultRequestData = t.TypeOf<
  typeof addTagToResultRequestDataCodec
>;

export type AddTagToResultRequest = ApiRequestMetadata & {
  searchResult: Pick<SearchResult, "id">;
  data: AddTagToResultRequestData;
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
