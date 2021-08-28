import { getClient as getSESClient, Client as SESClient } from "@src/lib/ses";

export const getClient = getSESClient;
export type Client = SESClient;
