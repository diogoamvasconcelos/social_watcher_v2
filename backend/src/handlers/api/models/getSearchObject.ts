import * as t from "io-ts";
import {
  searchObjectDomainCodec,
  SearchObjectIo,
} from "../../../domain/models/userItem";
import { ApiBaseErrorCode, ApiRequestMetadata } from "./models";

export type GetSearchObjectRequest = ApiRequestMetadata & {
  index: SearchObjectIo["index"];
};
export type GetSearchObjectErrorCode = ApiBaseErrorCode | "NOT_FOUND";

export const getSearchObjectResponseCodec = searchObjectDomainCodec;
export type GetSearchObjectResponse = t.TypeOf<
  typeof getSearchObjectResponseCodec
>;
