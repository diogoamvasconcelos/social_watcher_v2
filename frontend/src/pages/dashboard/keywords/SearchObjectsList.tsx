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
import MailOutlined from "@ant-design/icons/lib/icons/MailOutlined";
import CalendarOutlined from "@ant-design/icons/lib/icons/CalendarOutlined";
import Button from "antd/lib/button";
import { useHistory } from "react-router-dom";
import Tooltip from "antd/lib/tooltip";
import { capitalizeWord } from "../../../shared/lib/text";
import { SEARCH_PATH } from "../../../shared/data/paths";
import {
  getNotificationMediumIcon,
  getSocialMediaIcon,
} from "@src/shared/components/Icons";

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
  allowNewSearchObject: boolean;
  onNewSearchObjectClicked: () => void;
  onManageAccountClicked: () => void;
};
export const SearchObjectsList: React.FC<SearchObjectsListProps> = ({
  searchObjects,
  allowNewSearchObject,
  onNewSearchObjectClicked,
  onManageAccountClicked,
}) => {
  const sortedSearchObjects = [...searchObjects].sort((soA, soB) =>
    soA.createdAt > soB.createdAt ? 1 : -1
  ); // sort olders first

  return (
    <>
      <SearchObjectListContainer>
        {sortedSearchObjects.map((searchObject) => (
          <SearchObjectItem
            key={searchObject.index}
            searchObject={searchObject}
          />
        ))}
      </SearchObjectListContainer>
      <div style={{ margin: "20px" }}>
        <Tooltip
          title={
            allowNewSearchObject
              ? ""
              : "Subscription maximum reached. You can increase your account's subscription limit to allow more keywords."
          }
        >
          <Button
            type="primary"
            style={{ width: "200px", borderRadius: "4px" }}
            onClick={onNewSearchObjectClicked}
            disabled={!allowNewSearchObject}
          >
            Add new keyword
          </Button>
        </Tooltip>
        <Button
          type="link"
          // style={{ width: "200px", borderRadius: "4px" }}
          onClick={onManageAccountClicked}
          disabled={allowNewSearchObject}
        >
          Manage Account
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
  ).map((reportMedium) => {
    const getCustomTooltip = (): string | undefined => {
      switch (reportMedium) {
        case "email":
          return `to: ${searchObject.reportData.email.addresses?.join(", ")}`;
        default:
          return undefined;
      }
    };

    return getReportMediumIcon({
      reportMedium,
      searchFrequency: searchObject.reportData[reportMedium]
        .status as ReportFrequency,
      customTooltip: getCustomTooltip(),
    });
  });

  const handleConfigButtonClicked = () => {
    history.push(`${history.location.pathname}/${searchObject.index}`);
  };
  const handleSearchButtonClicked = () => {
    history.push(`${SEARCH_PATH}?keyword=${searchObject.keyword}`);
  };

  return (
    <SearchObjectItemContainer>
      <SearchObjectTopItemRow>
        <Text
          style={{ gridColumnStart: "1" }}
        >{`Keyword#${searchObject.index}: ${searchObject.keyword}`}</Text>
        <Tooltip title="Edit configuration">
          <Button
            style={{ gridColumnStart: "2", justifySelf: "end" }} // justifySelf:end aligns to right
            type="default"
            shape="circle"
            icon={<SettingFilled />}
            size="small"
            onClick={handleConfigButtonClicked}
          />
        </Tooltip>
        <Tooltip title="Go to search">
          <Button
            style={{ gridColumnStart: "3", justifySelf: "end" }}
            type="default"
            shape="circle"
            icon={<SearchOutlined />}
            size="small"
            onClick={handleSearchButtonClicked}
          />
        </Tooltip>
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

const getActiveNotificationMediums = (
  searchObject: SearchObjectDomain
): NotificationMedium[] => {
  return notificationMediums.filter(
    (notificationMedium) =>
      searchObject.notificationData[notificationMedium].enabledStatus ===
      "ENABLED"
  );
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
  customTooltip,
}: Pick<ReportJob, "reportMedium" | "searchFrequency"> & {
  customTooltip?: string;
}): React.ReactNode => {
  const getIcon = () => {
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

  return (
    <Tooltip
      title={`${capitalizeWord(searchFrequency)} ${capitalizeWord(
        reportMedium
      )} ${customTooltip}`}
      key={reportMedium}
    >
      {getIcon()}
    </Tooltip>
  );
};
