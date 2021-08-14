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
import SettingFilled from "@ant-design/icons/lib/icons/SettingFilled";
import SearchOutlined from "@ant-design/icons/lib/icons/SearchOutlined";
import TwitterOutlined from "@ant-design/icons/lib/icons/TwitterOutlined";
import RedditOutlined from "@ant-design/icons/lib/icons/RedditOutlined";
import WarningOutlined from "@ant-design/icons/lib/icons/WarningOutlined";
import InstagramOutlined from "@ant-design/icons/lib/icons/InstagramOutlined";
import YoutubeOutlined from "@ant-design/icons/lib/icons/YoutubeOutlined";
import SlackOutlined from "@ant-design/icons/lib/icons/SlackOutlined";
import MailOutlined from "@ant-design/icons/lib/icons/MailOutlined";
import CalendarOutlined from "@ant-design/icons/lib/icons/CalendarOutlined";
import Button from "antd/lib/button";
import { useHistory } from "react-router-dom";

// ++++++++
// + LIST +
// ++++++++
const SearchObjectListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

type SearchObjectsListProps = {
  searchObjects: SearchObjectDomain[];
};
export const SearchObjectsList: React.FC<SearchObjectsListProps> = ({
  searchObjects,
}) => {
  const handleNewSearchObjectButtonClicked = () => {
    console.log("New searchObject clicked");
  };

  return (
    <>
      <SearchObjectListContainer>
        {searchObjects.map((searchObject) => (
          <SearchObjectItem
            key={searchObject.index}
            searchObject={searchObject}
          />
        ))}
      </SearchObjectListContainer>
      <div style={{ margin: "20px" }}>
        <Button
          type="primary"
          style={{ width: "200px", borderRadius: "4px" }}
          onClick={handleNewSearchObjectButtonClicked}
        >
          Add new keyword
        </Button>
      </div>
    </>
  );
};

// ++++++++
// + ITEM +
// ++++++++

const SearchObjectItemContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-style: solid;
  border-width: 1px;
  border-radius: 4px;
  padding: 8px 16px;
`;

const SearchObjectItemRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;
`;
const SearchObjectTopItemRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 30px 30px;
`;

type SearchObjectItemProp = {
  searchObject: SearchObjectDomain;
};
const SearchObjectItem: React.FC<SearchObjectItemProp> = ({ searchObject }) => {
  const history = useHistory();

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

  const handleConfigButtonClicked = () => {
    history.push(`${history.location.pathname}/${searchObject.index}`);
  };
  const handleSearchButtonClicked = () => {
    // TODO: navigate to search and setting this keyword automatically (url params)
    console.log(`Search clicked for searchobject #${searchObject.index}`);
  };

  return (
    <SearchObjectItemContainer>
      <SearchObjectTopItemRow>
        <Text
          style={{ gridColumnStart: "1" }}
        >{`Keyword#${searchObject.index}: ${searchObject.keyword}`}</Text>
        <Button
          style={{ gridColumnStart: "2", justifySelf: "end" }} // justifySelf:end aligns to right
          type="default"
          shape="circle"
          icon={<SettingFilled />}
          size="small"
          onClick={handleConfigButtonClicked}
        />
        <Button
          style={{ gridColumnStart: "3", justifySelf: "end" }}
          type="default"
          shape="circle"
          icon={<SearchOutlined />}
          size="small"
          onClick={handleSearchButtonClicked}
        />
      </SearchObjectTopItemRow>
      <SearchObjectItemRow>
        <Text>Social Medias:</Text>
        {socialMediaIcons}
      </SearchObjectItemRow>
      <SearchObjectItemRow>
        <Text>Notifications:</Text>
        {notificationMediumIcons}
      </SearchObjectItemRow>
      <SearchObjectItemRow>
        <Text>Reports:</Text>
        {reportMediumIcons}
      </SearchObjectItemRow>
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
      return <TwitterOutlined key="twitter" />;
    case "reddit":
      return <RedditOutlined key="reddit" />;
    case "hackernews":
      return <WarningOutlined key="hackernews" />;
    case "instagram":
      return <InstagramOutlined key="instagram" />;
    case "youtube":
      return <YoutubeOutlined key="youtube" />;
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
      return <WarningOutlined key="discord" />;
    case "slack":
      return <SlackOutlined key="slack" />;
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
          return <MailOutlined key="email daily" />;
        case "WEEKLY":
          return <CalendarOutlined key="email weekly" />;
      }
  }
};
