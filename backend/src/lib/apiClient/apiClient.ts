import * as t from "io-ts";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { Either, isLeft, left } from "fp-ts/lib/Either";
import {
  SearchObjectIo,
  SearchObjectUserDataIo,
} from "../../domain/models/userItem";
import { getUserResponseCodec } from "../../handlers/api/models/getUser";
import { updateSearchObjectResponseCodec } from "../../handlers/api/models/updateSearchObject";
import {
  SearchRequestUserData,
  searchResponseCodec,
} from "../../handlers/api/models/search";
import { getSearchObjectsResponseCodec } from "../../handlers/api/models/getSearchObjects";
import {
  createPaymentsPortalResponseCodec,
  CreatePaymentsPortalUserData,
} from "../../handlers/api/models/createPaymentsPortal";
import { decode } from "@diogovasconcelos/lib/iots";
import { getSearchObjectResponseCodec } from "../../handlers/api/models/getSearchObject";
import { createSearchObjectResponseCodec } from "../../handlers/api/models/createSearchObject";

export const getClient = (baseURL: string) => {
  return axios.create({
    baseURL,
  });
};
export type Client = ReturnType<typeof getClient>;

export type ApiClientDeps = {
  client: Client;
  token: string;
};

type GenericCallParams = Pick<
  AxiosRequestConfig,
  "headers" | "method" | "url" | "data" | "params"
>;

const doGenericAPICall = async (
  deps: ApiClientDeps,
  { headers, method, url, data, params }: GenericCallParams
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

// +++++++++++
// + Methods +
// +++++++++++

type ClientMethod<U> = (deps: ApiClientDeps) => Promise<Either<ApiError, U>>;
const createClientMethod = <U>(
  params: GenericCallParams,
  resultDecoder: t.Decoder<unknown, U>
): ClientMethod<U> => {
  return async (deps) => {
    const apiResult = await doGenericAPICall(deps, params);
    if (apiResult.status != 200) {
      return left(apiResult);
    }

    const decodeResult = decode(resultDecoder, apiResult.data);
    if (isLeft(decodeResult)) {
      return left("DECODE_ERROR");
    }

    return decodeResult;
  };
};

export const getUser = createClientMethod(
  {
    method: "get",
    url: "user",
  },
  getUserResponseCodec
);

export const getSearchObjects = createClientMethod(
  {
    method: "get",
    url: "user/searchObject",
  },
  getSearchObjectsResponseCodec
);

// special case (with extra args), don't use the helper function yet (can be done I guess)
export const getSearchObject = async (
  deps: ApiClientDeps,
  data: {
    index: SearchObjectIo["index"];
  }
) =>
  createClientMethod(
    {
      method: "get",
      url: `user/searchObject/${data.index}`,
    },
    getSearchObjectResponseCodec
  )(deps);

export const createSearchObject = async (
  deps: ApiClientDeps,
  data: {
    userData: SearchObjectUserDataIo;
  }
) =>
  createClientMethod(
    {
      method: "post",
      url: `user/searchObject`,
      data: JSON.stringify(data.userData),
    },
    createSearchObjectResponseCodec
  )(deps);

export const updateSearchObject = async (
  deps: ApiClientDeps,
  data: {
    index: SearchObjectIo["index"];
    userData: SearchObjectUserDataIo;
  }
) =>
  createClientMethod(
    {
      method: "put",
      url: `user/searchObject/${data.index}`,
      data: JSON.stringify(data.userData),
    },
    updateSearchObjectResponseCodec
  )(deps);

export const search = async (
  deps: ApiClientDeps,
  data: {
    userData: SearchRequestUserData;
  }
) =>
  createClientMethod(
    {
      method: "post",
      url: `search`,
      data: JSON.stringify(data.userData),
    },
    searchResponseCodec
  )(deps);

export const createPaymentsPortal = async (
  deps: ApiClientDeps,
  data: {
    userData: CreatePaymentsPortalUserData;
  }
) =>
  createClientMethod(
    {
      method: "post",
      url: `/user/payments/create-portal`,
      data: JSON.stringify(data.userData),
    },
    createPaymentsPortalResponseCodec
  )(deps);
