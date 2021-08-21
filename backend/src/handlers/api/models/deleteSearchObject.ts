import {
  SearchObjectErrorCode,
  SearchObjectRequest,
  SearchObjectResponse,
  searchObjectResponseCodec,
} from "./models";

export type DeleteSearchObjectRequest = SearchObjectRequest;
export type DeleteSearchObjectErrorCode = SearchObjectErrorCode;

export const deleteSearchObjectResponseCodec = searchObjectResponseCodec;
export type DeleteSearchObjectResponse = SearchObjectResponse;
