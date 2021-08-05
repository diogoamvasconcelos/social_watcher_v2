import { newLowerCase } from "@diogovasconcelos/lib/iots";
import { SearchObjectUserDataDomain } from "../../src/domain/models/userItem";

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
    },
    instagram: {
      enabledStatus: "DISABLED",
    },
    youtube: {
      enabledStatus: "DISABLED",
    },
  },
  notificationData: {
    discordNotification: {
      enabledStatus: "ENABLED",
      channel: "discord-channel",
      bot: {
        credentials: {
          token: "discord-bot-token",
        },
      },
    },
    slackNotification: {
      enabledStatus: "ENABLED",
      channel: "slack-channel",
      bot: {
        credentials: {
          token: "slack-bot-token",
        },
      },
    },
  },
  reportData: {
    emailReport: {
      status: "DISABLED",
    },
  },
};
