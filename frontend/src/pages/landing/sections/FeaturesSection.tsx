import React from "react";
import styled from "styled-components";
import { SectionContainer, SectionContentContainer } from "./shared";
import { socialMedias } from "@backend/domain/models/socialMedia";
import { notificationMediums } from "@backend/domain/models/notificationMedium";
import { reportMediums } from "@backend/domain/models/reportMedium";
import { capitalizeWord } from "@src/shared/lib/text";
import {
  getNotificationMediumIcon,
  getReportMediumIcon,
  getSocialMediaIcon,
} from "@src/shared/components/Icons";
import Text from "antd/lib/typography/Text";

const FeaturesContainer = styled(SectionContainer)`
  background: lightcyan;
`;

const FeaturesContentContainer = styled(SectionContentContainer)``;

const FeaturesBoxContainer = styled.div`
  border-radius: 8px;
  border-style: solid;
  border-width: 1px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  align-items: center;
  width: 200px;
`;

const BoxTitle = styled(Text)`
  font-size: 18px;
  text-align: center;
`;

export const FeaturesSection: React.FC = () => {
  return (
    <FeaturesContainer>
      <Text>Features</Text>
      <FeaturesContentContainer>
        <FeaturesBoxContainer>
          <BoxTitle>Social Media Platforms</BoxTitle>
          {socialMedias.map((socialMedia) => (
            <ListItem
              text={capitalizeWord(socialMedia)}
              Icon={getSocialMediaIcon(socialMedia)}
              key={socialMedia}
            />
          ))}
        </FeaturesBoxContainer>
        <FeaturesBoxContainer>
          <BoxTitle>Notification Platforms</BoxTitle>
          {notificationMediums.map((notificationMedium) => (
            <ListItem
              text={capitalizeWord(notificationMedium)}
              Icon={getNotificationMediumIcon(notificationMedium)}
              key={notificationMedium}
            />
          ))}
        </FeaturesBoxContainer>
        <FeaturesBoxContainer>
          <BoxTitle>Daily/Weekly Reports</BoxTitle>
          {reportMediums.map((reportMedium) => (
            <ListItem
              text={capitalizeWord(reportMedium)}
              Icon={getReportMediumIcon(reportMedium)}
              key={reportMedium}
            />
          ))}
        </FeaturesBoxContainer>
        <FeaturesBoxContainer>
          <BoxTitle>Archives</BoxTitle>
          <Text>- Text based search is available</Text>
          <Text>
            - Filter the data based on date, social media, any other more
            advanced filters
          </Text>
        </FeaturesBoxContainer>
      </FeaturesContentContainer>
    </FeaturesContainer>
  );
};

const ListItemContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 4px;
  align-items: center;
`;

const ListItem: React.FC<{ text: string; Icon: React.ReactNode }> = ({
  text,
  Icon,
}) => {
  return (
    <ListItemContainer>
      {Icon}
      <Text>{text}</Text>
    </ListItemContainer>
  );
};
