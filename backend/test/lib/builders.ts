import _ from "lodash";
import { PartialDeep } from "type-fest";
import { SearchResult } from "../../src/domain/models/searchResult";
import { getNow } from "../../src/lib/date";
import { deepmergeSafe } from "@shared/lib/src/lib/deepmerge";
import { newLowerCase } from "@shared/lib/src//lib/iots";
import { JsonEncodable } from "@shared/lib/src/models/jsonEncodable";
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

export const buildSearchResultsEvent = (
  nofResults: number = 2,
  partialSearchResult: PartialDeep<SearchResult> = {}
) => {
  const searchResults: SearchResult[] = _.range(nofResults).map((_) =>
    buildSearchResult(partialSearchResult)
  );

  return buildSQSEvent(searchResults);
};
