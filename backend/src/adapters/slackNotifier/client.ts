import { getClient as getSlackClient } from "@src/lib/slack/client";

export const getClient = getSlackClient;
export type Client = ReturnType<typeof getClient>;
