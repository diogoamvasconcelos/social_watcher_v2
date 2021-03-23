import { getClient as getSQSClient } from "../../lib/sqs";

export const getClient = getSQSClient;
export type Client = ReturnType<typeof getClient>;
