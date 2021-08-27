import * as t from "io-ts";
import { JsonObjectEncodable } from "@diogovasconcelos/lib/models/jsonEncodable";
import { Either } from "fp-ts/lib/Either";
import {
  searchObjectDomainCodec,
  SearchObjectIo,
} from "@src/domain/models/userItem";
import { User } from "@src/domain/models/user";

// ++++++++++
// + SHARED +
// ++++++++++

export type ApiRequestMetadata = {
  authData: Pick<User, "id" | "email">;
};

export type ApiResponse<
  T extends string = string,
  B extends JsonObjectEncodable = JsonObjectEncodable
> = Either<ApiErrorResponse<T>, ApiSuccessResponse<B>>;

type ApiResponseMetadata = {
  statusCode: number;
};

export type ApiSuccessResponse<B extends JsonObjectEncodable> =
  ApiResponseMetadata & {
    body?: B;
  };

export type ApiErrorResponse<T extends string = ApiBaseErrorCode> =
  ApiResponseMetadata & {
    errorCode: T;
    errorMessage: string;
  };

export type ApiBaseErrorCode =
  | "INTERNAL_ERROR"
  | "REQUEST_MALFORMED"
  | "FORBIDDEN"
  | "UNAUTHORIZED";

// +++++++++++++++++
// + :SearchObject +
// +++++++++++++++++

export type SearchObjectErrorCode = ApiBaseErrorCode | "NOT_FOUND";

export type SearchObjectRequest = ApiRequestMetadata & {
  index: SearchObjectIo["index"];
};

export const searchObjectResponseCodec = searchObjectDomainCodec;
export type SearchObjectResponse = t.TypeOf<typeof searchObjectResponseCodec>;
