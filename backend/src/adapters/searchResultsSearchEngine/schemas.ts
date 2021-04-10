import { IndexSchema } from "../../lib/elasticsearch/client";

export const SEARCH_RESULT_SCHEMA: Record<string, IndexSchema | undefined> = {
  v1: {
    settings: {
      index: {
        number_of_shards: 1,
        auto_expand_replicas: "0-all",
      },
    },
    mappings: {
      dynamic: false,
      properties: {
        keyword: { type: "keyword" },
        socialMedia: { type: "keyword" },
        happenedAt: { type: "date" },
        data: { type: "text" },
      },
    },
  },
};
