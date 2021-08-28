// TODO
import _ from "lodash";
import { Logger } from "@src/lib/logger";
import { throwUnexpectedCase } from "@src/lib/runtime";
import { SlackNotificationConfig } from "@src/domain/models/notificationJob";
import {
  HackernewsSearchResult,
  InstagramSearchResult,
  RedditSearchResult,
  SearchResult,
  TwitterSearchResult,
  YoutubeSearchResult,
} from "@src/domain/models/searchResult";
import { SendMessageToChannelFn } from "@src/domain/ports/slackNotifier/sendMessageToChannel";
import { DefaultOkReturn } from "@src/domain/ports/shared";

export const notifySearchResultToSlack = async (
  {
    logger,
    sendMessageToChannel,
  }: {
    logger: Logger;
    sendMessageToChannel: SendMessageToChannelFn;
  },
  channel: SlackNotificationConfig["channel"],
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
    case "hackernews": {
      return buildHackernewsMessage(searchResult);
    }
    case "instagram": {
      return buildInstagramMessage(searchResult);
    }
    case "youtube": {
      return buildYoutubeMessage(searchResult);
    }
    default:
      return throwUnexpectedCase(searchResult, "slackBuildMessage");
  }
};

const buildTwitterMessage = (searchResult: TwitterSearchResult): string => {
  const messages = [
    `New '${searchResult.keyword}' Twitter message (${
      searchResult.data.followers_count ?? 0
    } followers)`,
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
    `New '${searchResult.keyword}' Instagram post (${searchResult.data.num_likes} likes, ${searchResult.data.num_comments} comments)`,
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

const buildYoutubeMessage = (searchResult: YoutubeSearchResult): string => {
  const messages = [
    `New '${searchResult.keyword}' youtube video (${searchResult.data.viewCount} views, ${searchResult.data.likeCount} likes)`,
    searchResult.data.title,
    searchResult.link,
    searchResult.data.translatedText
      ? [
          `Translated message (lang: ${searchResult.data.lang})`,
          "```",
          searchResult.data.translatedText,
          "```",
        ]
      : undefined,
    searchResult.data.thumbnailUrl,
  ];

  return _.flatten(messages)
    .filter((message) => message != undefined)
    .join("\n");
};
