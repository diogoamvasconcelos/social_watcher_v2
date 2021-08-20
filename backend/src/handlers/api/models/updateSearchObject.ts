import { SearchObjectUserDataIo } from "../../../domain/models/userItem";
import {
  SearchObjectErrorCode,
  SearchObjectRequest,
  SearchObjectResponse,
  searchObjectResponseCodec,
} from "./models";

export type UpdateSearchObjectRequest = SearchObjectRequest & {
  data: SearchObjectUserDataIo;
};
export type UpdateSearchObjectErrorCode = SearchObjectErrorCode;

export const updateSearchObjectResponseCodec = searchObjectResponseCodec;
export type UpdateSearchObjectResponse = SearchObjectResponse;
