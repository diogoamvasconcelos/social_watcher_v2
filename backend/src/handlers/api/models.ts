import { Either } from "fp-ts/lib/Either";
import { User } from "../../domain/models/user";
import { JsonObjectEncodable } from "../../lib/models/jsonEncodable";

export type ApiRequestMetadata = {
  authData: Pick<User, "id" | "email">;
};

export type ApiResponse<T extends string = string> = Either<
  ApiErrorResponse<T>,
  ApiSuccessResponse
>;

type ApiResponseMetadata = {
  statusCode: number;
};

export type ApiSuccessResponse = ApiResponseMetadata & {
  body?: JsonObjectEncodable;
};

export type ApiErrorResponse<
  T extends string = ApiBaseErrorCode
> = ApiResponseMetadata & {
  errorCode: T;
  errorMessage: string;
};

export type ApiBaseErrorCode =
  | "INTERNAL_ERROR"
  | "REQUEST_MALFORMED"
  | "FORBIDDEN"
  | "UNAUTHORIZED";
