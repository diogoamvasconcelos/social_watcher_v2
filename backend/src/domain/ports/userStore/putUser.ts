import { Logger } from "../../../lib/logger";
import { User } from "../../models/user";
import { DefaultOkReturn } from "../shared";

export type PutUserFn = (logger: Logger, user: User) => DefaultOkReturn;
