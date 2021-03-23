import { getClient as getTwitterClient } from "../../lib/twitter";

export const getClient = getTwitterClient;
export type Client = ReturnType<typeof getClient>;
