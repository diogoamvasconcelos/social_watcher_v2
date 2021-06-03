import { PartialDeep } from "type-fest";
import {
  RedditSearchResult,
  SearchResult,
  TwitterSearchResult,
} from "../../src/domain/models/searchResult";
import { getNow, toUnixTimstamp } from "../../src/lib/date";
import { deepmergeSafe } from "@diogovasconcelos/lib";
import { newLowerCase } from "@diogovasconcelos/lib";
import { JsonEncodable } from "@diogovasconcelos/lib";
import { uuid } from "../../src/lib/uuid";

export const buildSQSEvent = (items: JsonEncodable[]): JsonEncodable => {
  return {
    Records: items.map((item) => ({
      body: JSON.stringify(item),
      messageId: uuid(),
      receiptHandle: "receiptHandle",
      md5OfBody: "md5OfBody",
      eventSource: "eventSource",
      eventSourceARN: "eventSourceARN",
      awsRegion: "awsRegion",
      attributes: {
        AWSTraceHeader: "trace header",
        ApproximateReceiveCount: "1",
        SentTimestamp: "now",
        SenderId: "sender id",
        ApproximateFirstReceiveTimestamp: "earlier",
      },
      messageAttributes: {
        test: {
          stringValue: "string",
          binaryValue: "string",
          stringListValues: [],
          binaryListValues: [],
          dataType: "Number",
        },
      },
    })),
  };
};

export const buildSearchResult = (
  partial?: PartialDeep<SearchResult>
): SearchResult => {
  switch (partial?.socialMedia) {
    case undefined: // default
    case "twitter":
      return buildTwitterSearchResult({ ...partial, socialMedia: "twitter" });
    case "reddit":
      return buildRedditSearchResult(partial);
  }
};

export const buildTwitterSearchResult = (
  partial?: PartialDeep<TwitterSearchResult>
): TwitterSearchResult => {
  const now = getNow();
  const id = uuid();

  return deepmergeSafe(
    {
      id,
      keyword: newLowerCase(uuid()),
      socialMedia: "twitter",
      happenedAt: now,
      link: "some-link",
      data: {
        id,
        text: "some-text",
        created_at: now,
        conversation_id: "conversation-id",
        author_id: "author_id",
        lang: "en",
      },
    },
    partial ?? {}
  );
};
export const buildRedditSearchResult = (
  partial?: PartialDeep<RedditSearchResult>
): RedditSearchResult => {
  const now = getNow();
  const id = uuid();

  return deepmergeSafe(
    {
      id,
      keyword: newLowerCase(uuid()),
      socialMedia: "reddit",
      happenedAt: now,
      link: "some-link",
      data: {
        id,
        author: "author",
        selftext: "some-text",
        title: "some-title",
        permalink: "link",
        created_utc: toUnixTimstamp(new Date()),
        num_comments: 0,
        num_crossposts: 0,
        ups: 0,
        subreddit: "some-subreddit",
        subreddit_subscribers: 0,
        over_18: false as boolean,
      },
    },
    partial ?? {}
  );
};
