import * as t from "io-ts";
import {
  searchObjectDomainCodec,
  SearchObjectIo,
  SearchObjectUserDataIo,
} from "../../../domain/models/userItem";
import { ApiBaseErrorCode, ApiRequestMetadata } from "./models";

export type UpdateSearchObjectRequest = ApiRequestMetadata & {
  data: SearchObjectUserDataIo;
} & { index: SearchObjectIo["index"] };

export type UpdateSearchObjectErrorCode = ApiBaseErrorCode;

export const updateSearchObjectResponseCodec = searchObjectDomainCodec;
export type UpdateSearchObjectResponse = t.TypeOf<
  typeof updateSearchObjectResponseCodec
>;
