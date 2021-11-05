import React from "react";
import { SocialMedia } from "@backend/domain/models/socialMedia";
import Tooltip from "antd/lib/tooltip";
import Icon from "@ant-design/icons/lib/components/Icon";
import TwitterOutlined from "@ant-design/icons/lib/icons/TwitterOutlined";
import RedditOutlined from "@ant-design/icons/lib/icons/RedditOutlined";
import InstagramOutlined from "@ant-design/icons/lib/icons/InstagramOutlined";
import YoutubeOutlined from "@ant-design/icons/lib/icons/YoutubeOutlined";
import SlackOutlined from "@ant-design/icons/lib/icons/SlackOutlined";
import MailOutlined from "@ant-design/icons/lib/icons/MailOutlined";
import DiscordIcon from "../../../assets/discord-icon.svg";
import HackernewsIcon from "../../../assets/hackernews-icon.svg";
import { capitalizeWord } from "../lib/text";
import { NotificationMedium } from "@backend/domain/models/notificationMedium";
import { ReportMedium } from "@backend/domain/models/reportMedium";

export const getSocialMediaIcon = (
  socialMedia: SocialMedia
): React.ReactElement => {
  const getIcon = () => {
    switch (socialMedia) {
      case "twitter":
        return <TwitterOutlined />;
      case "reddit":
        return <RedditOutlined />;
      case "hackernews":
        return <Icon component={HackernewsIcon} />;
      case "instagram":
        return <InstagramOutlined />;
      case "youtube":
        return <YoutubeOutlined />;
    }
  };

  return (
    <Tooltip title={capitalizeWord(socialMedia)} key={socialMedia}>
      {getIcon()}
    </Tooltip>
  );
};

export const getNotificationMediumIcon = (
  notificationMedium: NotificationMedium
): React.ReactElement => {
  const getIcon = () => {
    switch (notificationMedium) {
      case "discord":
        return <Icon component={DiscordIcon} />;
      case "slack":
        return <SlackOutlined />;
    }
  };

  return (
    <Tooltip
      title={capitalizeWord(notificationMedium)}
      key={notificationMedium}
    >
      {getIcon()}
    </Tooltip>
  );
};

export const getReportMediumIcon = (
  reportMedium: ReportMedium
): React.ReactElement => {
  const getIcon = () => {
    switch (reportMedium) {
      case "email":
        return <MailOutlined />;
    }
  };

  return (
    <Tooltip title={capitalizeWord(reportMedium)} key={reportMedium}>
      {getIcon()}
    </Tooltip>
  );
};
