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
import { useHistory } from "react-router-dom";
import Tooltip from "antd/lib/tooltip";
import { capitalizeWord } from "../../../shared/lib/text";
import { ARCHIVES_PATH } from "../../../shared/data/paths";
import {
  getNotificationMediumIcon,
  getSocialMediaIcon,
} from "@src/shared/components/Icons";
import { size } from "@src/shared/style/sizing";
import { boxDropShadow, boxLessRoundBorder } from "@src/shared/style/box";
import { colors } from "@src/shared/style/colors";
import { fontSize } from "@src/shared/style/fonts";
import {
  ElevatedPrimaryButton,
  PrimaryButton,
} from "@src/shared/style/components/button";

// ++++++++
// + LIST +
// ++++++++
const SearchObjectListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${size.size16px};
`;

const BottomButtonBar = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${size.size16px};
  margin: ${size.size32px};
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
      <BottomButtonBar>
        <Tooltip
          title={
            allowNewSearchObject
              ? ""
              : "Subscription maximum reached. You can increase your account's subscription limit to allow more keywords."
          }
        >
          <ElevatedPrimaryButton
            size="large"
            type="primary"
            // style={{ width: "200px" }}
            onClick={onNewSearchObjectClicked}
            disabled={!allowNewSearchObject}
          >
            Add new Keyword
          </ElevatedPrimaryButton>
        </Tooltip>
        {allowNewSearchObject ? null : (
          <ElevatedPrimaryButton
            size="large"
            type="link"
            onClick={onManageAccountClicked}
          >
            Manage Account
          </ElevatedPrimaryButton>
        )}
      </BottomButtonBar>
    </>
  );
};

// ++++++++
// + ITEM +
// ++++++++

const SearchObjectItemContainer = styled.div`
  ${boxDropShadow}
  ${boxLessRoundBorder}
  background: linear-gradient(0deg, ${colors.neutral.light3} 70%, ${colors
    .neutral.light15} 30%);
  display: flex;
  flex-direction: column;
  gap: ${size.size8px};
  border-style: solid;
  border-width: 1px;
  border-color: ${colors.neutral.mediumDark};
  padding: ${size.size16px} ${size.size32px} ${size.size16px};

  color: ${colors.neutral.dark3};
  & span {
    color: ${colors.neutral.dark3};
  }
`;

const SearchObjectTopItemRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  padding-bottom: ${size.size8px};

  & .keyword-text {
    font-size: ${fontSize.size24px};
    color: ${colors.support.purple.dark1};
  }
`;
const SearchObjectItemRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${size.size8px};
  align-items: center;

  font-size: ${fontSize.size14px};
  & .anticon {
    font-size: ${fontSize.size18px};
  }
`;

const NoneText = styled.div`
  color: ${colors.neutral.dark1};
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
    history.push(`${ARCHIVES_PATH}?keyword=${searchObject.keyword}`);
  };

  return (
    <SearchObjectItemContainer>
      <SearchObjectTopItemRow>
        <Text style={{ gridColumnStart: "1" }}>
          <span className="keyword-text">{searchObject.keyword}</span>
        </Text>
        <PrimaryButton
          style={{
            gridColumnStart: "2",
            justifySelf: "end",
          }}
          type="default"
          icon={<SearchOutlined />}
          onClick={handleSearchButtonClicked}
        >
          Browse Archives
        </PrimaryButton>
      </SearchObjectTopItemRow>
      <SearchObjectItemRow>
        <Text>social media:</Text>
        {socialMediaIcons.length > 0 ? (
          socialMediaIcons
        ) : (
          <NoneText>none</NoneText>
        )}
      </SearchObjectItemRow>
      <SearchObjectItemRow>
        <Text>notifications:</Text>
        {notificationMediumIcons.length > 0 ? (
          notificationMediumIcons
        ) : (
          <NoneText>none</NoneText>
        )}
      </SearchObjectItemRow>
      <SearchObjectItemRow>
        <Text>reports:</Text>
        {reportMediumIcons.length > 0 ? (
          reportMediumIcons
        ) : (
          <NoneText>none</NoneText>
        )}
      </SearchObjectItemRow>
      <PrimaryButton
        type="ghost"
        icon={<SettingFilled />}
        onClick={handleConfigButtonClicked}
        style={{ alignSelf: "center" }}
      >
        Edit Keyword
      </PrimaryButton>
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
