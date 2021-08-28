import {
  getClient as getQueueClient,
  Client as QueueClient,
} from "@src/adapters/queueShared";

export const getClient = getQueueClient;
export type Client = QueueClient;
