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
} from "@backend/lib/apiClient/apiClient";
import { getConfig } from "./config";
import { getUserIdToken } from "./userSession";

const config = getConfig();

export const apiClient: Client = getClient(config.apiEndpoint);

export const apiGetUser = async () => {
  return await getUser({ client: apiClient, token: getUserIdToken() ?? "" });
};

export const apiGetSearchObjects = async () => {
  return await getSearchObjects({
    client: apiClient,
    token: getUserIdToken() ?? "",
  });
};

export const apiGetSearchObject = async (index: SearchObjectIo["index"]) => {
  return await getSearchObject(
    {
      client: apiClient,
      token: getUserIdToken() ?? "",
    },
    { index }
  );
};

export const apiSearch = async (userData: SearchRequestUserData) => {
  return search(
    { client: apiClient, token: getUserIdToken() ?? "" },
    { userData }
  );
};

export const apiCreateSearchObject = async (
  userData: SearchObjectUserDataIo
) => {
  return createSearchObject(
    { client: apiClient, token: getUserIdToken() ?? "" },
    { userData }
  );
};

export const apiUpdateSearchObject = async (
  index: SearchObjectIo["index"],
  userData: SearchObjectUserDataIo
) => {
  return updateSearchObject(
    { client: apiClient, token: getUserIdToken() ?? "" },
    { index, userData }
  );
};

export const apiDeleteSearchObject = async (index: SearchObjectIo["index"]) => {
  return await deleteSearchObject(
    {
      client: apiClient,
      token: getUserIdToken() ?? "",
    },
    { index }
  );
};

export const apiGetDefaultSearchObject = async () => {
  return await getDefaultSearchObject({
    client: apiClient,
    token: getUserIdToken() ?? "",
  });
};

export const apiCreatePaymentsPortal = async (
  userData: CreatePaymentsPortalUserData
) => {
  return createPaymentsPortal(
    { client: apiClient, token: getUserIdToken() ?? "" },
    { userData }
  );
};
