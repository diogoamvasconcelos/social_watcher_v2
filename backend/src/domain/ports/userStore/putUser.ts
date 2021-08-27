import { Logger } from "@src/lib/logger";
import { User } from "@src/domain/models/user";
import { DefaultOkReturn } from "@src/domain/ports/shared";

export type PutUserFn = (logger: Logger, user: User) => DefaultOkReturn;
