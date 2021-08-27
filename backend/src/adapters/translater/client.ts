import { getClient as getTranslateClient } from "@src/lib/translate";

export const getClient = getTranslateClient;
export type Client = ReturnType<typeof getClient>;
