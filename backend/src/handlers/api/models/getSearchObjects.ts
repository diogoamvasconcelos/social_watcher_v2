import * as t from "io-ts";
import { searchObjectDomainCodec } from "@src/domain/models/userItem";
import { ApiBaseErrorCode, ApiRequestMetadata } from "./models";

export type GetSearchObjectsRequest = ApiRequestMetadata;
export type GetSearchObjectsErrorCode = ApiBaseErrorCode;

export const getSearchObjectsResponseCodec = t.type({
  items: t.array(searchObjectDomainCodec),
});
export type GetSearchObjectsResponse = t.TypeOf<
  typeof getSearchObjectsResponseCodec
>;
