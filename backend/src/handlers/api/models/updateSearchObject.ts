import * as t from "io-ts";
import {
  SearchObject,
  searchObjectCodec,
  SearchObjectUserData,
} from "../../../domain/models/userItem";
import { ApiBaseErrorCode, ApiRequestMetadata } from "./models";

export type UpdateSearchObjectRequest = ApiRequestMetadata & {
  data: SearchObjectUserData;
} & { index: SearchObject["index"] };

export type UpdateSearchObjectErrorCode = ApiBaseErrorCode;

export const updateSearchObjectResponseCodec = searchObjectCodec;
export type UpdateSearchObjectResponse = t.TypeOf<
  typeof updateSearchObjectResponseCodec
>;
