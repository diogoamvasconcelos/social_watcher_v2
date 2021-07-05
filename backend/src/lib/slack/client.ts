import { right } from "fp-ts/lib/Either";
import { Logger } from "../logger";
import { SlackCredentials } from "./models";

export const getClient = ({ token }: SlackCredentials): Client => {
  return { token };
};
export type Client = {
  token: string;
};

export type SlackDependencies = {
  client: Client;
  logger: Logger;
};

export const sendMessage = async (
  { logger, client }: SlackDependencies,
  message: string
) => {
  logger.debug("slack sendMessage using client", { client, message });
  return right("OK");
};
