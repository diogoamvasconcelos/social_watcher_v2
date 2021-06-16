import * as t from "io-ts";
import {
  SearchObjectDomain,
  searchObjectIoCodec,
} from "../../../domain/models/userItem";
import { ApiBaseErrorCode, ApiRequestMetadata } from "./models";

export type GetSearchObjectsRequest = ApiRequestMetadata;
export type GetSearchObjectsErrorCode = ApiBaseErrorCode;

export const getSearchObjectsResponseCodec = t.type({
  items: t.array(searchObjectIoCodec),
});
export type GetSearchObjectsResponse = {
  items: SearchObjectDomain[];
};
