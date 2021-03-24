import { Logger } from "../../../lib/logger";
import { SearchJob } from "../../models/searchJobs";
import { SocialMedia } from "../../models/socialMedia";
import { GenericReturn } from "../shared";

export type QueueSearchJobsFn = (
  logger: Logger,
  socialMedia: SocialMedia,
  searchJobs: SearchJob[]
) => GenericReturn;
