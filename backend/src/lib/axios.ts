import { AxiosInstance, AxiosRequestConfig } from "axios";

export const doRequest = async (
  client: AxiosInstance,
  request: AxiosRequestConfig
) => {
  return await client.request({
    validateStatus: (status: number) => {
      return status >= 100 && status <= 600;
    },
    ...request,
  });
};
