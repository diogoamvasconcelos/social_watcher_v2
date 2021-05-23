import {
  getClient as getDiscordClient,
  Client as DiscordClient,
} from "../../lib/discord/client";

export const getClient = getDiscordClient;
export type Client = DiscordClient;
