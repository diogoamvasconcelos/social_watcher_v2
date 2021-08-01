import { SocialMedia } from "../../domain/models/socialMedia";
import { QueueSearchJobsFn } from "../..//domain/ports/searchJobsQueue/queueSearchJobs";
import { makeQueueJobs } from "../queueShared";
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
