import {
  SearchObjectIo,
  SearchObjectUserDataIo,
} from "@backend/domain/models/userItem";
import { CreatePaymentsPortalUserData } from "@backend/handlers/api/models/createPaymentsPortal";
import { SearchRequestUserData } from "@backend/handlers/api/models/search";
import {
  getClient,
  getSearchObjects,
  getUser,
  search,
  updateSearchObject,
  createPaymentsPortal,
  Client,
  getSearchObject,
  createSearchObject,
  deleteSearchObject,
  getDefaultSearchObject,
  ApiClientDeps,
} from "@backend/lib/apiClient/apiClient";
import { getConfig } from "./config";
import { getUserIdToken } from "./userSession";

const config = getConfig();

export const apiClient: Client = getClient(config.apiEndpoint);

const getApiDeps = async (): Promise<ApiClientDeps> => {
  return {
    token: await getUserIdToken(),
    client: apiClient,
  };
};

export const apiGetUser = async () => {
  return await getUser(await getApiDeps());
};

export const apiGetSearchObjects = async () => {
  return await getSearchObjects(await getApiDeps());
};

export const apiGetSearchObject = async (index: SearchObjectIo["index"]) => {
  return await getSearchObject(await getApiDeps(), { index });
};

export const apiSearch = async (userData: SearchRequestUserData) => {
  return search(await getApiDeps(), { userData });
};

export const apiCreateSearchObject = async (
  userData: SearchObjectUserDataIo
) => {
  return createSearchObject(await getApiDeps(), { userData });
};

export const apiUpdateSearchObject = async (
  index: SearchObjectIo["index"],
  userData: SearchObjectUserDataIo
) => {
  return updateSearchObject(await getApiDeps(), { index, userData });
};

export const apiDeleteSearchObject = async (index: SearchObjectIo["index"]) => {
  return await deleteSearchObject(await getApiDeps(), { index });
};

export const apiGetDefaultSearchObject = async () => {
  return await getDefaultSearchObject(await getApiDeps());
};

export const apiCreatePaymentsPortal = async (
  userData: CreatePaymentsPortalUserData
) => {
  return createPaymentsPortal(await getApiDeps(), { userData });
};
