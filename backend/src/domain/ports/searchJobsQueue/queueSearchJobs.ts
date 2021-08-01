import { SearchJob } from "../../models/searchJob";
import { SocialMedia } from "../../models/socialMedia";
import { QueueJobsFn } from "../shared";

export type QueueSearchJobsFn = QueueJobsFn<SocialMedia, SearchJob>;
