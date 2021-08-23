import {
  newEmailFromString,
  newLowerCase,
  newPositiveInteger,
} from "@diogovasconcelos/lib/iots";
import { uuid } from "../../src/lib/uuid";
import {
  SearchObjectDomain,
  SearchObjectUserDataDomain,
} from "../../src/domain/models/userItem";

export const defaultSearchObjectDataDomain: SearchObjectUserDataDomain = {
  keyword: newLowerCase("some_keyword"),
  searchData: {
    twitter: {
      enabledStatus: "ENABLED",
    },
    reddit: {
      enabledStatus: "DISABLED",
      over18: false,
    },
    hackernews: {
      enabledStatus: "DISABLED",
      fuzzyMatch: false,
    },
    instagram: {
      enabledStatus: "DISABLED",
    },
    youtube: {
      enabledStatus: "DISABLED",
    },
  },
  notificationData: {
    discord: {
      enabledStatus: "ENABLED",
      channel: "discord-channel",
      bot: {
        credentials: {
          token: "discord-bot-token",
        },
      },
    },
    slack: {
      enabledStatus: "DISABLED",
      channel: "",
      bot: {
        credentials: {
          token: "",
        },
      },
    },
  },
  reportData: {
    email: {
      status: "DAILY",
      addresses: [newEmailFromString("default@email.com")],
    },
  },
};

export const defaultSearchObjectDomain: SearchObjectDomain = {
  ...defaultSearchObjectDataDomain,
  type: "SEARCH_OBJECT",
  id: uuid(),
  lockedStatus: "LOCKED",
  index: newPositiveInteger(0),
};
