import { getClient as getTranslateClient } from "../../lib/translate";

export const getClient = getTranslateClient;
export type Client = ReturnType<typeof getClient>;
