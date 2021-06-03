import _ from "lodash";
import { Logger } from "../../lib/logger";
import { throwUnexpectedCase } from "../../lib/runtime";
import { DiscordNotificationConfig } from "../models/notificationJob";
import {
  RedditSearchResult,
  SearchResult,
  TwitterSearchResult,
} from "../models/searchResult";
import { SendMessageToChannelFn } from "../ports/discordNotifier/sendMessageToChannel";
import { DefaultOkReturn } from "../ports/shared";

export const notifySearchResultToDiscord = async (
  {
    logger,
    sendMessageToChannel,
  }: {
    logger: Logger;
    sendMessageToChannel: SendMessageToChannelFn;
  },
  channel: DiscordNotificationConfig["channel"],
  searchResult: SearchResult
): DefaultOkReturn => {
  const message = buildMessage(searchResult);
  return await sendMessageToChannel(logger, channel, message);
};

const buildMessage = (searchResult: SearchResult): string => {
  switch (searchResult.socialMedia) {
    case "twitter": {
      return buildTwitterMessage(searchResult);
    }
    case "reddit": {
      return buildRedditMessage(searchResult);
    }
    default:
      return throwUnexpectedCase(searchResult, "discordBuildMessage");
  }
};

const buildTwitterMessage = (searchResult: TwitterSearchResult): string => {
  const messages = [
    `New '${searchResult.keyword}' Twitter message`,
    searchResult.link,
    searchResult.data.translatedText
      ? [
          `Translated message (lang: ${searchResult.data.lang})`,
          "```",
          searchResult.data.translatedText,
          "```",
        ]
      : undefined,
  ];

  return _.flatten(messages)
    .filter((message) => message != undefined)
    .join("\n");
};

const buildRedditMessage = (searchResult: RedditSearchResult): string => {
  const messages = [
    `New '${searchResult.keyword}' Reddit message`,
    searchResult.link,
    searchResult.data.translatedText
      ? [
          `Translated message (lang: ${searchResult.data.lang})`,
          "```",
          searchResult.data.translatedText,
          "```",
        ]
      : undefined,
  ];

  return _.flatten(messages)
    .filter((message) => message != undefined)
    .join("\n");
};
