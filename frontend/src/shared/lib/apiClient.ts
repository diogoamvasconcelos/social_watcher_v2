import { SearchRequestUserData } from "../../../../backend/src/handlers/api/models/search";
import {
  getClient,
  getSearchObjects,
  getUser,
  search,
} from "../../../../backend/src/lib/apiClient/apiClient";
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
