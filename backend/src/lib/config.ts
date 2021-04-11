import * as t from "io-ts";
import { isLeft } from "fp-ts/lib/Either";
import { decode, positiveInteger } from "./iots";

export const ensure = (name: string): string => {
  const value = process.env[name];
  if (value == null) {
    throw new Error(`Missing environment variable ${name}`);
  }

  return value;
};

const ensureAndDecode = <A>(name: string, codec: t.Decoder<unknown, A>): A => {
  const value = process.env[name] ?? "";
  const decodeResult = decode(codec, JSON.parse(value));

  if (isLeft(decodeResult)) {
    throw Error(`Unexpected value environment variable ${name}:\n ${value}`);
  }

  return decodeResult.right;
};

export const getConfig = () => {
  return {
    env: ensure("ENV"),
    usersTableName: ensure("USERS_TABLE_NAME"),
    keywordsTableName: ensure("KEYWORDS_TABLE_NAME"),
    searchResultsTableName: ensure("SEARCH_RESULTS_TABLE_NAME"),
    searchJobQueueTemplateName: ensure("SEARCH_JOBS_QUEUE_TEMPLATE_NAME"),
    mainElasticSearchUrl: ensure("MAIN_ELASTIC_SEARCH_URL"),
    searchResultIndexVersion: ensureAndDecode(
      "SEARCH_RESULT_INDEX_VERSION",
      positiveInteger
    ),
  };
};

export const getSecret = (secretName: string): string => {
  return ensure(secretName);
};

export type Config = ReturnType<typeof getConfig>;
