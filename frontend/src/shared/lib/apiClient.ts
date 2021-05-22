import {
  SearchObject,
  SearchObjectUserData,
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
} from "@backend/lib/apiClient/apiClient";
import { getConfig } from "./config";
import { getUserIdToken } from "./userSession";

const config = getConfig();

export const apiClient = getClient(config.apiEndpoint);

export const apiGetUser = async () => {
  return await getUser({ client: apiClient, token: getUserIdToken() ?? "" });
};

export const apiGetSearchObjects = async () => {
  return await getSearchObjects({
    client: apiClient,
    token: getUserIdToken() ?? "",
  });
};

export const apiSearch = async (userData: SearchRequestUserData) => {
  return search(
    { client: apiClient, token: getUserIdToken() ?? "" },
    { userData }
  );
};

export const apiUpdateSearchObject = async (
  index: SearchObject["index"],
  userData: SearchObjectUserData
) => {
  return updateSearchObject(
    { client: apiClient, token: getUserIdToken() ?? "" },
    { index, userData }
  );
};

export const apiCreatePaymentsPortal = async (
  userData: CreatePaymentsPortalUserData
) => {
  return createPaymentsPortal(
    { client: apiClient, token: getUserIdToken() ?? "" },
    { userData }
  );
};
