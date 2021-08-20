import {
  SearchObjectErrorCode,
  SearchObjectRequest,
  SearchObjectResponse,
  searchObjectResponseCodec,
} from "./models";

export type GetSearchObjectRequest = SearchObjectRequest;
export type GetSearchObjectErrorCode = SearchObjectErrorCode;

export const getSearchObjectResponseCodec = searchObjectResponseCodec;
export type GetSearchObjectResponse = SearchObjectResponse;
