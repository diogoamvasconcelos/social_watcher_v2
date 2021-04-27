import {
  getClient,
  getSearchObjects,
  getUser,
} from "../../../../backend/src/lib/apiClient/apiClient";
import { getConfig } from "./config";
import { getUserIdToken } from "./userSession";

const config = getConfig();

export const apiClient = getClient(config.apiEndpoint);

export const apiGetUser = async () => {
  return getUser({ client: apiClient, token: getUserIdToken() ?? "" });
};

export const apiGetSearchObjects = async () => {
  return getSearchObjects({ client: apiClient, token: getUserIdToken() ?? "" });
};
