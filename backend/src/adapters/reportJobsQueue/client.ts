import {
  getClient as getQueueClient,
  Client as QueueClient,
} from "../queueShared";

export const getClient = getQueueClient;
export type Client = QueueClient;
