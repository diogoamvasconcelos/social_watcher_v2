import _ from "lodash";
import { Logger } from "../../lib/logger";
import { throwUnexpectedCase } from "../../lib/runtime";
import { DiscordNotificationConfig } from "../models/notificationJob";
import {
  HackernewsSearchResult,
  InstagramSearchResult,
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

// TODO: turn this into a generic function as it's getting duplicated in all notifySearchResultTo....
const buildMessage = (searchResult: SearchResult): string => {
  switch (searchResult.socialMedia) {
    case "twitter": {
      return buildTwitterMessage(searchResult);
    }
    case "reddit": {
      return buildRedditMessage(searchResult);
    }
    case "hackernews": {
      return buildHackernewsMessage(searchResult);
    }
    case "instagram": {
      return buildInstagramMessage(searchResult);
    }
    default:
      return throwUnexpectedCase(searchResult, "discordBuildMessage");
  }
};

const buildTwitterMessage = (searchResult: TwitterSearchResult): string => {
  const messages = [
    // TODO: add number of followers
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
    `New '${searchResult.keyword}' Reddit post (${
      searchResult.data.num_comments + searchResult.data.num_crossposts
    } comments)`,
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

const buildHackernewsMessage = (
  searchResult: HackernewsSearchResult
): string => {
  const messages = [
    `New '${searchResult.keyword}' Hackernews post (${searchResult.data.numComments} comments)`,
    searchResult.link,
    searchResult.data.storyId
      ? [`parent: ${searchResult.data.storyLink}`]
      : undefined,
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

const buildInstagramMessage = (searchResult: InstagramSearchResult): string => {
  const messages = [
    `New '${searchResult.keyword}' Instagram post`,
    searchResult.link,
    searchResult.data.translatedText
      ? [
          `Translated message (lang: ${searchResult.data.lang})`,
          "```",
          searchResult.data.translatedText,
          "```",
        ]
      : undefined,
    searchResult.data.display_url,
  ];

  return _.flatten(messages)
    .filter((message) => message != undefined)
    .join("\n");
};
