import {
  YoutubeCredentials,
  youtubeSearchResponseCodec,
  YoutubeVideosResponse,
  youtubeVideosResponseCodec,
  YoutubeVideosResponseItem,
} from "./models";
import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { Logger } from "../logger";
import { deepmergeSafe } from "@diogovasconcelos/lib/deepmerge";
import { doRequest } from "../axios";
import { Either, isLeft, left, right } from "fp-ts/lib/Either";
import { decode, toSingleEither } from "@diogovasconcelos/lib/iots";
import { getMinutesAgo } from "../date";
import { JsonEncodable } from "@diogovasconcelos/lib/models/jsonEncodable";

export const getClient = (
  credentials: YoutubeCredentials
): { instance: AxiosInstance; credentials: YoutubeCredentials } => {
  return {
    instance: axios.create({
      baseURL: "https://www.googleapis.com/youtube",
    }),
    credentials,
  };
};
export type Client = ReturnType<typeof getClient>;

export type YoutubeDependencies = {
  client: Client;
  logger: Logger;
};

// ++++++++++
// + SEARCH +
// ++++++++++

export type SearchParams = {
  maxResults: number;
  minutesAgo: number;
};

const defaultSearchParams: SearchParams = {
  maxResults: 100,
  minutesAgo: 10,
};

export const search = async (
  { logger, client }: YoutubeDependencies,
  keyword: string,
  params?: Partial<SearchParams>
) => {
  // search but only keep videos
  // get video details to add more data
  const searchParams = deepmergeSafe(defaultSearchParams, params ?? {});
  let results: YoutubeVideosResponse["items"] = [];

  let nextPageToken: string = "";

  const startTime = getMinutesAgo(searchParams.minutesAgo);

  do {
    const request: AxiosRequestConfig = {
      params: {
        key: client.credentials.apiKey,
        q: keyword,
        publishedAfter: startTime,
        maxResults: Math.min(searchParams.maxResults, 50),
        type: "video",
        safeSearch: "none",
        part: ["snippet", "contentDetails", "statistics"].join(","),
      },
      url: "3/search",
      method: "GET",
    };

    if (nextPageToken.length > 0) {
      request.params = { ...request.params, pageToken: nextPageToken };
    }

    const response = await doRequest(client.instance, request);
    if (response.status != 200) {
      return left([`${response.status} : ${response.data}`]);
    }

    logger.info("search response", {
      response: response as unknown as JsonEncodable,
    });

    const responseEither = decode(youtubeSearchResponseCodec, response.data);
    if (isLeft(responseEither)) {
      logger.error("Failed to decode youtubeSearchResponse", {
        error: responseEither.left,
      });
      return responseEither;
    }

    const patchedItemsEither = toSingleEither(
      await Promise.all(
        responseEither.right.items.map(async (item) => {
          return await getVideo({ client, logger }, item.id.videoId ?? "");
        })
      )
    );
    if (isLeft(patchedItemsEither)) {
      return left(patchedItemsEither.left.flat());
    }

    results = [...results, ...patchedItemsEither.right];

    nextPageToken = responseEither.right.nextPageToken;
  } while (
    nextPageToken.length > 0 &&
    results.length < searchParams.maxResults
  );
};

// ++++++++++
// + VIDEOS +
// ++++++++++
export const getVideo = async (
  { logger, client }: YoutubeDependencies,
  videoId: string
): Promise<Either<string[], YoutubeVideosResponseItem>> => {
  const request: AxiosRequestConfig = {
    params: {
      key: client.credentials.apiKey,
      part: ["snippet", "contentDetails", "statistics"].join(","),
      id: videoId,
    },
    url: "3/videos",
    method: "GET",
  };

  const response = await doRequest(client.instance, request);
  if (response.status != 200) {
    return left([`${response.status} : ${response.data}`]);
  }

  const responseEither = decode(youtubeVideosResponseCodec, response.data);
  if (isLeft(responseEither)) {
    logger.error("Failed to decode youtubeVideosResponse", {
      error: responseEither.left,
    });
    return responseEither;
  }

  if (responseEither.right.items.length != 1) {
    logger.error("youtubeVideosResponse didn't return 1 and only 1 item", {
      response: responseEither.right,
    });
    return left(["ERROR: didn't return 1 item"]);
  }

  return right(responseEither.right.items[0]);
};
