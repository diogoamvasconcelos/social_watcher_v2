import * as t from "io-ts";
import {
  searchObjectDomainCodec,
  SearchObjectUserDataIo,
} from "../../../domain/models/userItem";
import { ApiBaseErrorCode, ApiRequestMetadata } from "./models";

export type CreateSearchObjectRequest = ApiRequestMetadata & {
  data: SearchObjectUserDataIo;
};

export type CreateSearchObjectErrorCode = ApiBaseErrorCode;

export const createSearchObjectResponseCodec = searchObjectDomainCodec;
export type createSearchObjectResponse = t.TypeOf<
  typeof createSearchObjectResponseCodec
>;
