import * as t from "io-ts";
import { ApiBaseErrorCode, ApiRequestMetadata } from "./models";

export const createPaymentsPortalUserDataCodec = t.exact(
  t.type({
    returnUrl: t.string,
  })
);
export type CreatePaymentsPortalUserData = t.TypeOf<
  typeof createPaymentsPortalUserDataCodec
>;

export type CreatePaymentsPortalRequest = ApiRequestMetadata &
  CreatePaymentsPortalUserData;
export type CreatePaymentsPortalErrorCode = ApiBaseErrorCode;

export const createPaymentsPortalResponseCodec = t.type({
  sessionUrl: t.string,
});
export type CreatePaymentsPortalResponse = t.TypeOf<
  typeof createPaymentsPortalResponseCodec
>;
