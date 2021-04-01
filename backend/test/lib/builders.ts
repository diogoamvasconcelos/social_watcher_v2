import { JsonEncodable } from "../../src/lib/models/jsonEncodable";
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
