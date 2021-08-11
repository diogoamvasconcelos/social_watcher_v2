import React from "react";
import { SearchObjectDomain } from "@backend/domain/models/userItem";
import styled from "styled-components";
import Text from "antd/lib/typography/Text";
import { SocialMedia, socialMedias } from "@backend/domain/models/socialMedia";
import {
  NotificationMedium,
  notificationMediums,
} from "@backend/domain/models/notificationMedium";
import {
  ReportMedium,
  reportMediums,
} from "@backend/domain/models/reportMedium";
import { ReportFrequency, ReportJob } from "@backend/domain/models/reportJob";
import TwitterOutlined from "@ant-design/icons/lib/icons/TwitterOutlined";
import RedditOutlined from "@ant-design/icons/lib/icons/RedditOutlined";
import WarningOutlined from "@ant-design/icons/lib/icons/WarningOutlined";
import InstagramOutlined from "@ant-design/icons/lib/icons/InstagramOutlined";
import YoutubeOutlined from "@ant-design/icons/lib/icons/YoutubeOutlined";
import SlackOutlined from "@ant-design/icons/lib/icons/SlackOutlined";
import MailOutlined from "@ant-design/icons/lib/icons/MailOutlined";
import CalendarOutlined from "@ant-design/icons/lib/icons/CalendarOutlined";

// ++++++++
// + LIST +
// ++++++++
const SearchObjectListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

type SearchObjectsListProps = {
  searchObjects: SearchObjectDomain[];
};
export const SearchObjectsList: React.FC<SearchObjectsListProps> = ({
  searchObjects,
}) => {
  return (
    <SearchObjectListContainer>
      {searchObjects.map((searchObject) => (
        <SearchObjectItem searchObject={searchObject} />
      ))}
    </SearchObjectListContainer>
  );
};

// ++++++++
// + ITEM +
// ++++++++

const SearchObjectItemContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  border-style: solid;
  border-width: 1px;
  border-radius: 4px;
`;

type SearchObjectItemProp = {
  searchObject: SearchObjectDomain;
};
const SearchObjectItem: React.FC<SearchObjectItemProp> = ({ searchObject }) => {
  const socialMediaIcons: React.ReactNode[] = getActiveSocialMedias(
    searchObject
  ).map((socialMedia) => getSocialMediaIcon(socialMedia));

  const notificationMediumIcons: React.ReactNode[] =
    getActiveNotificationMediums(searchObject).map((notificationMedium) =>
      getNotificationMediumIcon(notificationMedium)
    );

  const reportMediumIcons: React.ReactNode[] = getActiveReportMediums(
    searchObject
  ).map((reportMedium) =>
    getReportMediumIcon({
      reportMedium,
      searchFrequency: searchObject.reportData[reportMedium]
        .status as ReportFrequency,
    })
  );

  return (
    <SearchObjectItemContainer>
      <Text>{`Index: ${searchObject.index}`}</Text>
      <Text>{`Keyword: ${searchObject.keyword}`}</Text>
      <Text>Social Medias:</Text>
      {socialMediaIcons}
      <Text>Notifications:</Text>
      {notificationMediumIcons}
      <Text>Reports:</Text>
      {reportMediumIcons}
    </SearchObjectItemContainer>
  );
};

const getActiveSocialMedias = (
  searchObject: SearchObjectDomain
): SocialMedia[] => {
  return socialMedias.filter(
    (socialMedia) =>
      searchObject.searchData[socialMedia].enabledStatus === "ENABLED"
  );
};

const getSocialMediaIcon = (socialMedia: SocialMedia): React.ReactNode => {
  switch (socialMedia) {
    case "twitter":
      return <TwitterOutlined />;
    case "reddit":
      return <RedditOutlined />;
    case "hackernews":
      return <WarningOutlined />;
    case "instagram":
      return <InstagramOutlined />;
    case "youtube":
      return <YoutubeOutlined />;
  }
};

const getActiveNotificationMediums = (
  searchObject: SearchObjectDomain
): NotificationMedium[] => {
  return notificationMediums.filter(
    (notificationMedium) =>
      searchObject.notificationData[notificationMedium].enabledStatus ===
      "ENABLED"
  );
};

const getNotificationMediumIcon = (
  notificatioMedium: NotificationMedium
): React.ReactNode => {
  switch (notificatioMedium) {
    case "discord":
      return <WarningOutlined />;
    case "slack":
      return <SlackOutlined />;
  }
};

const getActiveReportMediums = (
  searchObject: SearchObjectDomain
): ReportMedium[] => {
  return reportMediums.filter(
    (reportMedium) =>
      searchObject.reportData[reportMedium].status !== "DISABLED"
  );
};

const getReportMediumIcon = ({
  reportMedium,
  searchFrequency,
}: Pick<ReportJob, "reportMedium" | "searchFrequency">): React.ReactNode => {
  switch (reportMedium) {
    case "email":
      switch (searchFrequency) {
        case "DAILY":
          return <MailOutlined />;
        case "WEEKLY":
          return <CalendarOutlined />;
      }
  }
};
