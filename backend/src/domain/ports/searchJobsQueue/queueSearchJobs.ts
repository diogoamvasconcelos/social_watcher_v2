import { SearchJob } from "../../models/searchJobs";
import { SocialMedia } from "../../models/socialMedia";
import { GenericReturn } from "../shared";

export type QueueSearchJobsFn = (
  socialMedia: SocialMedia,
  searchJobs: SearchJob[]
) => GenericReturn;
