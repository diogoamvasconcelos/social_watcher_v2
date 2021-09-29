import * as t from "io-ts";
import {
  searchObjectDomainCodec,
  SearchObjectUserDataIo,
} from "../../../domain/models/userItem";
import { ApiBaseErrorCode, ApiRequestMetadata } from "./models";

export type CreateSearchObjectRequest = ApiRequestMetadata & {
  data: SearchObjectUserDataIo;
};

export type CreateSearchObjectErrorCode = ApiBaseErrorCode | "INVALID_KEYWORD";

export const createSearchObjectResponseCodec = searchObjectDomainCodec;
export type createSearchObjectResponse = t.TypeOf<
  typeof createSearchObjectResponseCodec
>;
