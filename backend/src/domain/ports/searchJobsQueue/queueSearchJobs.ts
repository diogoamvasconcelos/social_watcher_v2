import { Either } from "fp-ts/lib/Either";
import { SearchJob } from "../../models/searchJobs";
import { SocialMedia } from "../../models/socialMedia";

export type QueueSearchJobsFn = (
  socialMedia: SocialMedia,
  searchJobs: SearchJob[]
) => Promise<Either<"ERROR", "OK">>;
