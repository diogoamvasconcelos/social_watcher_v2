import { JsonEncodable } from "./models/jsonEncodable";
import { Either, left, right } from "fp-ts/lib/Either";

export function parseSafe<T extends JsonEncodable>(
  s: string | null
): Either<string, T> {
  try {
    if (s == null) {
      return left("JSON::parseSafe string is null");
    }

    const x = JSON.parse(s) as T;
    return right(x);
  } catch (error) {
    if (error instanceof Error) {
      return left(error.message);
    }
    return left("unknown error while parsing JSON");
  }
}
