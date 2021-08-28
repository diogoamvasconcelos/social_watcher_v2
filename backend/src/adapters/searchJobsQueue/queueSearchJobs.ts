import { SocialMedia } from "@src/domain/models/socialMedia";
import { QueueSearchJobsFn } from "@src//domain/ports/searchJobsQueue/queueSearchJobs";
import { makeQueueJobs } from "@src/adapters/queueShared";
import { Client } from "./client";

export const makeQueueSearchJobs = (
  client: Client,
  searchJobQueueTemplateName: string
): QueueSearchJobsFn => {
  return makeQueueJobs(
    client,
    (socialMedia: SocialMedia) =>
      searchJobQueueTemplateName.replace("{socialMedia}", socialMedia),
    "report"
  );
};
