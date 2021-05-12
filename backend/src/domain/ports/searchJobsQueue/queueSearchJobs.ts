import { Logger } from "../../../lib/logger";
import { SearchJob } from "../../models/searchJob";
import { SocialMedia } from "../../models/socialMedia";
import { DefaultOkReturn } from "../shared";

export type QueueSearchJobsFn = (
  logger: Logger,
  socialMedia: SocialMedia,
  searchJobs: SearchJob[]
) => DefaultOkReturn;
