import { SearchJob } from "@src/domain/models/searchJob";
import { SocialMedia } from "@src/domain/models/socialMedia";
import { QueueJobsFn } from "@src/domain/ports/shared";

export type QueueSearchJobsFn = QueueJobsFn<SocialMedia, SearchJob>;
