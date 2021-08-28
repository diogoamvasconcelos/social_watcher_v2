import {
  getClient as getSQSClient,
  getQueueUrlFromName,
  sendMessages,
} from "@src/lib/sqs";
import { isLeft, left, right } from "fp-ts/lib/Either";
import { QueueJobsFn } from "@src/domain/ports/shared";
import { JsonObjectEncodable } from "@diogovasconcelos/lib/models/jsonEncodable";

export const getClient = getSQSClient;
export type Client = ReturnType<typeof getClient>;

export const makeQueueJobs = <T extends string, J extends JsonObjectEncodable>(
  client: Client,
  getQueueNameFn: (queueNameInput: T) => string,
  jobType: string
): QueueJobsFn<T, J> => {
  return async (logger, queueNameInput, notificationJobs) => {
    if (notificationJobs.length == 0) {
      logger.info(
        `Skipping queueing ${jobType} Jobs for ${queueNameInput}: empty list.`
      );
      return right("OK");
    }

    const toUrl = await getQueueUrlFromName(
      client,
      getQueueNameFn(queueNameInput),
      logger
    );
    if (isLeft(toUrl)) {
      logger.error("getQueueUrlFromName failed.", {
        error: toUrl.left,
        jobType,
      });
      return left("ERROR");
    }

    const result = await sendMessages(
      client,
      toUrl.right,
      notificationJobs.map((job) => ({
        Body: JSON.stringify(job),
      })),
      logger
    );
    if (isLeft(result)) {
      logger.error("sendMessages failed.", { error: result.left, jobType });
      return left("ERROR");
    }

    return right("OK");
  };
};
