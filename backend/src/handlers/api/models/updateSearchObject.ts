import * as t from "io-ts";
import {
  SearchObjectIo,
  searchObjectIoCodec,
  SearchObjectUserDataIo,
} from "../../../domain/models/userItem";
import { ApiBaseErrorCode, ApiRequestMetadata } from "./models";

export type UpdateSearchObjectRequest = ApiRequestMetadata & {
  data: SearchObjectUserDataIo;
} & { index: SearchObjectIo["index"] };

export type UpdateSearchObjectErrorCode = ApiBaseErrorCode;

export const updateSearchObjectResponseCodec = searchObjectIoCodec;
export type UpdateSearchObjectResponse = t.TypeOf<
  typeof updateSearchObjectResponseCodec
>;
