import * as t from "io-ts";
import { resultTagCodec } from "../../../domain/models/userItem";
import { ApiBaseErrorCode, ApiRequestMetadata } from "./models";

export type GetResultTagsRequest = ApiRequestMetadata;
export type GetResultTagsErrorCode = ApiBaseErrorCode;

export const getResultTagsResponseCodec = t.type({
  items: t.array(resultTagCodec),
});
export type GetResultTagsResponse = t.TypeOf<typeof getResultTagsResponseCodec>;
