import { Either } from "fp-ts/lib/Either";
import { User } from "../../../domain/models/user";
import { JsonObjectEncodable } from "@diogovasconcelos/lib";

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
