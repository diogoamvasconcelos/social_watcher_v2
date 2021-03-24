import { isLeft, left, right } from "fp-ts/lib/Either";
import { QueueSearchJobsFn } from "../../domain/ports/searchJobsQueue/queueSearchJobs";
import { getQueueUrlFromName, sendMessages } from "../../lib/sqs";
import { Client } from "./client";

export const makeQueueSearchJobs = (
  client: Client,
  searchJobQueueTemplateName: string
): QueueSearchJobsFn => {
  return async (logger, socialMedia, searchJobs) => {
    const queueName = searchJobQueueTemplateName.replace(
      "{socialMedia}",
      socialMedia
    );
    const toUrl = await getQueueUrlFromName(client, queueName, logger);
    if (isLeft(toUrl)) {
      logger.error("getQueueUrlFromName failed.", { error: toUrl.left });
      return left("ERROR");
    }

    const result = await sendMessages(
      client,
      toUrl.right,
      searchJobs.map((searchJob) => ({
        Body: JSON.stringify(searchJob),
      })),
      logger
    );
    if (isLeft(result)) {
      logger.error("sendMessages failed.", { error: result.left });
      return left("ERROR");
    }

    return right("OK");
  };
};
