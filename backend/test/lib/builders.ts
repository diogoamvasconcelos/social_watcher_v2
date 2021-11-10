import { PartialDeep } from "type-fest";
import {
  HackernewsSearchResult,
  InstagramSearchResult,
  RedditSearchResult,
  SearchResult,
  toUniqueId,
  TwitterSearchResult,
  YoutubeSearchResult,
} from "@src/domain/models/searchResult";
import { getNow, toUnixTimstamp } from "@src/lib/date";
import { deepmergeSafe } from "@diogovasconcelos/lib/deepmerge";
import {
  newEmailFromString,
  newLowerCase,
  newNumberFromStringy,
  newPositiveInteger,
} from "@diogovasconcelos/lib/iots";
import { JsonEncodable } from "@diogovasconcelos/lib/models/jsonEncodable";
import { uuid } from "@src/lib/uuid";
import { SQSEvent } from "aws-lambda";
import { SocialMedia } from "@src/domain/models/socialMedia";
import {
  ResultTag,
  SearchObjectDomain,
  SearchObjectUserDataDomain,
} from "@src/domain/models/userItem";
import { User } from "@src/domain/models/user";

export const buildSQSEvent = (items: JsonEncodable[]): SQSEvent => {
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
    case "hackernews":
      return buildHackernewsSearchResult(partial);
    case "instagram":
      return buildInstagramSearchResult(partial);
    case "youtube":
      return buildYoutubeSearchResult(partial);
  }
};

export const buildTwitterSearchResult = (
  partial?: PartialDeep<TwitterSearchResult>
): TwitterSearchResult => {
  const now = getNow();
  const localId = uuid();
  const socialMedia: SocialMedia = "twitter";

  return deepmergeSafe(
    {
      id: toUniqueId({ socialMedia, localId }),
      localId,
      keyword: newLowerCase(uuid()),
      socialMedia,
      happenedAt: now,
      link: "some-link",
      data: {
        id: localId,
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
  const localId = uuid();
  const socialMedia: SocialMedia = "reddit";

  return deepmergeSafe(
    {
      id: toUniqueId({ socialMedia, localId }),
      localId,
      keyword: newLowerCase(uuid()),
      socialMedia,
      happenedAt: now,
      link: "some-link",
      data: {
        id: localId,
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

export const buildHackernewsSearchResult = (
  partial?: PartialDeep<HackernewsSearchResult>
): HackernewsSearchResult => {
  const now = getNow();
  const localId = uuid();
  const socialMedia: SocialMedia = "hackernews";

  return deepmergeSafe(
    {
      id: toUniqueId({ socialMedia, localId }),
      localId,
      keyword: newLowerCase(uuid()),
      socialMedia,
      happenedAt: now,
      link: "some-link",
      data: {
        id: localId,
        text: "some-text",
        author: "author",
        objectId: "objectId",
        storyId: "storyId",
        storyLink: "some-story-link",
        numComments: 0,
        fuzzyMatch: false as boolean, // lol
      },
    },
    partial ?? {}
  );
};

export const buildInstagramSearchResult = (
  partial?: PartialDeep<InstagramSearchResult>
): InstagramSearchResult => {
  const now = getNow();
  const localId = uuid();
  const socialMedia: SocialMedia = "instagram";

  return deepmergeSafe(
    {
      id: toUniqueId({ socialMedia, localId }),
      localId,
      keyword: newLowerCase(uuid()),
      socialMedia,
      happenedAt: now,
      link: "some-link",
      data: {
        id: localId,
        caption: "some-caption",
        owner: "owner",
        shortcode: "shortcode",
        display_url: "display_url",
        num_comments: 0,
        num_likes: 0,
        is_video: false as boolean, // lol
        num_video_views: 0,
      },
    },
    partial ?? {}
  );
};

export const buildYoutubeSearchResult = (
  partial?: PartialDeep<YoutubeSearchResult>
): YoutubeSearchResult => {
  const now = getNow();
  const localId = uuid();
  const socialMedia: SocialMedia = "youtube";

  return deepmergeSafe(
    {
      id: toUniqueId({ socialMedia, localId }),
      localId,
      keyword: newLowerCase(uuid()),
      socialMedia,
      happenedAt: now,
      link: "some-link",
      data: {
        id: localId,
        title: "title",
        description: "decription",
        viewCount: newNumberFromStringy("0"),
        likeCount: newNumberFromStringy("0"),
        favoriteCount: newNumberFromStringy("0"),
        commentCount: newNumberFromStringy("0"),
        thumbnailUrl: "thumbnail-url",
        durationInSeconds: 1,
      },
    },
    partial ?? {}
  );
};

export const buildSearchObjectDataDomain = (): SearchObjectUserDataDomain => {
  return {
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
};

export const buildSearchObjectDomain = (
  partial?: PartialDeep<SearchObjectDomain>
): SearchObjectDomain => {
  return deepmergeSafe(
    {
      ...buildSearchObjectDataDomain(),
      type: "SEARCH_OBJECT",
      id: uuid(),
      lockedStatus: "LOCKED",
      index: newPositiveInteger(0),
      createdAt: getNow(),
    },
    //@ts-expect-error
    partial ?? {}
  );
};

export const buildResultTag = (partial?: PartialDeep<ResultTag>): ResultTag => {
  return deepmergeSafe(
    {
      type: "RESULT_TAG",
      id: uuid(),
      tagId: uuid(),
      tagType: "FAVORITE",
      createdAt: getNow(),
    },
    //@ts-expect-error
    partial ?? {}
  );
};

export const buildUser = (partial?: PartialDeep<User>): User => {
  return deepmergeSafe(
    {
      id: "some-id",
      email: "some-email",
      subscription: {
        status: "ACTIVE",
        type: "NORMAL",
        nofSearchObjects: newPositiveInteger(1),
      },
    },
    //@ts-expect-error
    partial ?? {}
  );
};
