import React from "react";
import styled from "styled-components";
import {
  SectionContainer,
  SectionContentContainer,
  SectionTitle,
  ContentBox,
  ContentBoxTitle,
  ContentBoxList,
  ContentIconText,
} from "./shared";
import { socialMedias } from "@backend/domain/models/socialMedia";
import { notificationMediums } from "@backend/domain/models/notificationMedium";
import { reportMediums } from "@backend/domain/models/reportMedium";
import { capitalizeWord } from "@src/shared/lib/text";
import {
  getNotificationMediumIcon,
  getReportMediumIcon,
  getSocialMediaIcon,
} from "@src/shared/components/Icons";
import CheckCircleOutlined from "@ant-design/icons/lib/icons/CheckCircleOutlined";

const FeaturesContentContainer = styled(SectionContentContainer)``;

const FeaturesBoxContainer = styled(ContentBox)`
  padding: 0px 0px;
`;

export const FeaturesSection: React.FC = () => {
  return (
    <SectionContainer>
      <SectionTitle>Features</SectionTitle>
      <FeaturesContentContainer>
        <FeaturesBoxContainer>
          <ContentBoxTitle>Supported Social Media</ContentBoxTitle>
          <ContentBoxList>
            {socialMedias.map((socialMedia) => (
              <ContentIconText
                text={capitalizeWord(socialMedia)}
                Icon={getSocialMediaIcon(socialMedia)}
                key={socialMedia}
              />
            ))}
          </ContentBoxList>
        </FeaturesBoxContainer>
        <FeaturesBoxContainer>
          <ContentBoxTitle>Available Notifications</ContentBoxTitle>
          <ContentBoxList>
            {notificationMediums.map((notificationMedium) => (
              <ContentIconText
                text={capitalizeWord(notificationMedium)}
                Icon={getNotificationMediumIcon(notificationMedium)}
                key={notificationMedium}
              />
            ))}
          </ContentBoxList>
        </FeaturesBoxContainer>
        <FeaturesBoxContainer>
          <ContentBoxTitle>Daily/Weekly Reports</ContentBoxTitle>
          <ContentBoxList>
            {reportMediums.map((reportMedium) => (
              <ContentIconText
                text={capitalizeWord(reportMedium)}
                Icon={getReportMediumIcon(reportMedium)}
                key={reportMedium}
              />
            ))}
          </ContentBoxList>
        </FeaturesBoxContainer>
        <FeaturesBoxContainer>
          <ContentBoxTitle>Archives</ContentBoxTitle>
          <ContentBoxList>
            <ContentIconText
              text={"Text-based search queries"}
              Icon={<CheckCircleOutlined />}
            />
            <ContentIconText
              text={"Filter and analyze all the data"}
              Icon={<CheckCircleOutlined />}
            />
          </ContentBoxList>
        </FeaturesBoxContainer>
      </FeaturesContentContainer>
    </SectionContainer>
  );
};
