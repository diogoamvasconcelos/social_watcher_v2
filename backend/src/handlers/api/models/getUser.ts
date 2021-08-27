import * as t from "io-ts";
import { userCodec } from "@src/domain/models/user";
import { ApiBaseErrorCode, ApiRequestMetadata } from "./models";

export type GetUserRequest = ApiRequestMetadata;
export type GetUserErrorCode = ApiBaseErrorCode;

export const getUserResponseCodec = userCodec;
export type GetUserResponse = t.TypeOf<typeof getUserResponseCodec>;
