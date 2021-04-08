import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { Either, isLeft, left } from "fp-ts/lib/Either";
import { User, userCodec } from "../../domain/models/user";
import { decode } from "../iots";
import { Logger } from "../logger";
import {
  SearchObject,
  searchObjectCodec,
  SearchObjectUserData,
} from "../../domain/models/userItem";

export const getClient = (baseURL: string) => {
  return axios.create({
    baseURL,
  });
};
export type Client = ReturnType<typeof getClient>;

export type ApiClientDeps = {
  client: Client;
  token: string;
  logger: Logger;
};

const doGenericAPICall = async (
  deps: ApiClientDeps,
  {
    headers,
    method,
    url,
    data,
    params,
  }: Pick<AxiosRequestConfig, "headers" | "method" | "url" | "data" | "params">
) => {
  const request: AxiosRequestConfig = {
    method,
    url,
    data,
    headers: {
      Authorization: `Bearer ${deps.token}`,
      ...headers,
    },
    params,
    validateStatus: (status: number) => status >= 100 && status <= 600,
  };

  return await deps.client.request(request);
};

export type ApiError = AxiosResponse | "DECODE_ERROR";

export const getUser = async (
  deps: ApiClientDeps
): Promise<Either<ApiError, User>> => {
  const apiResult = await doGenericAPICall(deps, {
    method: "get",
    url: "user",
  });
  if (apiResult.status != 200) {
    return left(apiResult);
  }

  const decodeResult = decode(userCodec, apiResult.data);
  if (isLeft(decodeResult)) {
    return left("DECODE_ERROR");
  }

  return decodeResult;
};

export const updateSearchObject = async (
  deps: ApiClientDeps,
  data: {
    index: SearchObject["index"];
    userData: SearchObjectUserData;
  }
): Promise<Either<ApiError, SearchObject>> => {
  const apiResult = await doGenericAPICall(deps, {
    method: "put",
    url: `user/searchObject/${data.index}`,
    data: JSON.stringify(data.userData),
  });
  if (apiResult.status != 200) {
    return left(apiResult);
  }

  const decodeResult = decode(searchObjectCodec, apiResult.data);
  if (isLeft(decodeResult)) {
    return left("DECODE_ERROR");
  }

  return decodeResult;
};
