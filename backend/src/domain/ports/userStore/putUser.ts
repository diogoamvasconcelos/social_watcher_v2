import { Logger } from "../../../lib/logger";
import { User } from "../../models/user";
import { GenericReturn } from "../shared";

export type PutUserFn = (logger: Logger, user: User) => GenericReturn;
