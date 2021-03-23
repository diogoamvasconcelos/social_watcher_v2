import { isLeft, left, right } from "fp-ts/lib/Either";
import { SearchJob } from "../../domain/models/searchJobs";
import { SocialMedia } from "../../domain/models/socialMedia";
import { QueueSearchJobsFn } from "../../domain/ports/searchJobsQueue/queueSearchJobs";
import { getQueueUrlFromName, sendMessages } from "../../lib/sqs";
import { Client } from "./client";

export const makeQueueSearchJobs = (
  client: Client,
  searchJobQueueTemplateName: string
): QueueSearchJobsFn => {
  return async (socialMedia: SocialMedia, searchJobs: SearchJob[]) => {
    const queueName = searchJobQueueTemplateName.replace(
      "{socialMedia}",
      socialMedia
    );
    const toUrl = await getQueueUrlFromName(client, queueName);
    if (isLeft(toUrl)) {
      console.error(toUrl.left);
      return left("ERROR");
    }

    const result = await sendMessages(
      client,
      toUrl.right,
      searchJobs.map((searchJob) => ({
        Body: JSON.stringify(searchJob),
      }))
    );
    if (isLeft(result)) {
      console.error(result.left);
      return left("ERROR");
    }

    return right("OK");
  };
};
