import * as t from "io-ts";
import { searchResultCodec } from "@src/domain/models/searchResult";
import { resultTagIdCodec } from "@src/domain/models/userItem";
import { ApiBaseErrorCode, ApiRequestMetadata } from "./models";

export const addTagToResultRequestDataCodec = t.type({
  tagId: resultTagIdCodec,
});

export type AddTagToResultRequest = ApiRequestMetadata & {
  data: t.TypeOf<typeof addTagToResultRequestDataCodec>;
};
export type AddTagToResultErrorCode =
  | ApiBaseErrorCode
  | "SEARCH_RESULT_NOT_FOUND"
  | "RESULT_TAG_NOT_FOUND";

export const addTagToResultResponseCodec = searchResultCodec;
export type AddTagToResultResponse = t.TypeOf<
  typeof addTagToResultResponseCodec
>;
