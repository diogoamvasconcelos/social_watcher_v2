import React from "react";
import styled from "styled-components";
import {
  SectionContainer,
  SectionContentContainer,
  SectionTitle,
  ContentBox,
  ContentBoxTitle,
  ContentBoxText,
  ContentBoxList,
  ContentIconText,
} from "./shared";
import BinocularIcon from "../../../../assets/binocular-outline.svg";
import NotificationOutlined from "@ant-design/icons/lib/icons/NotificationOutlined";
import FileTextOutlined from "@ant-design/icons/lib/icons/FileTextOutlined";
import FileSearchOutlined from "@ant-design/icons/lib/icons/FileSearchOutlined";
import CheckCircleOutlined from "@ant-design/icons/lib/icons/CheckCircleOutlined";
import Icon from "@ant-design/icons/lib/components/Icon";
import Text from "antd/lib/typography/Text";
import { colors } from "@src/shared/style/colors";
import { size } from "@src/shared/style/sizing";
import { boxDropShadow, boxRoundBorder } from "@src/shared/style/box";
import { socialMedias } from "@backend/domain/models/socialMedia";
import { capitalizeWord } from "@src/shared/lib/text";
import {
  getNotificationMediumIcon,
  getReportMediumIcon,
  getSocialMediaIcon,
} from "@src/shared/components/Icons";
import { fontSize } from "@src/shared/style/fonts";
import { notificationMediums } from "@backend/domain/models/notificationMedium";

const HiWContentContainer = styled(SectionContentContainer)``;

const HiWBox = styled(ContentBox)`
  ${boxDropShadow}
  ${boxRoundBorder}
  background-color: ${colors.neutral.light3};

  display: grid;
  grid-auto-rows: 230px 162px;
  justify-content: center;
  align-items: start;
`;

const HiWMainBoxContainer = styled(ContentBox)`
  & .anticon {
    font-size: ${size.size64px};
    color: ${colors.neutral.dark2};
  }
`;

const HiWBoxFeaturesContainer = styled(ContentBoxList)`
  gap: ${size.size8px};
  margin: ${size.size16px};
`;

const HiwBoxFeaturesTitle = styled(Text)`
  font-size: ${fontSize.size12px};
  color: ${colors.neutral.mediumDark};
`;

const FeaturesIconText = styled(ContentIconText)``;
const featuresIconTextStyleOverride = { newFontSize: fontSize.size14px };

export const HowItWorksSection: React.FC = () => {
  return (
    <SectionContainer>
      <SectionTitle style={{ color: colors.neutral.light2 }}>
        How it works
      </SectionTitle>
      <HiWContentContainer>
        <HiWBox>
          <HiWMainBoxContainer>
            <Icon component={BinocularIcon} />
            <ContentBoxTitle>Automatic Search</ContentBoxTitle>
            <ContentBoxText>
              The Social Watcher regularly searches social media for your
              selected keywords
            </ContentBoxText>
          </HiWMainBoxContainer>
          <HiWBoxFeaturesContainer>
            <HiwBoxFeaturesTitle>supported social media</HiwBoxFeaturesTitle>
            {socialMedias.map((socialMedia) => (
              <FeaturesIconText
                text={capitalizeWord(socialMedia)}
                Icon={getSocialMediaIcon(socialMedia)}
                styleOverride={featuresIconTextStyleOverride}
                key={socialMedia}
              />
            ))}
          </HiWBoxFeaturesContainer>
        </HiWBox>
        <HiWBox>
          <HiWMainBoxContainer>
            <NotificationOutlined />
            <ContentBoxTitle>Get Notifications</ContentBoxTitle>
            <ContentBoxText>
              When it finds any relevant data, it sends you a notification right
              away
            </ContentBoxText>
          </HiWMainBoxContainer>
          <HiWBoxFeaturesContainer>
            <HiwBoxFeaturesTitle>available notifications</HiwBoxFeaturesTitle>
            {notificationMediums.map((notificationMedium) => (
              <FeaturesIconText
                text={capitalizeWord(notificationMedium)}
                Icon={getNotificationMediumIcon(notificationMedium)}
                styleOverride={featuresIconTextStyleOverride}
                key={notificationMedium}
              />
            ))}
          </HiWBoxFeaturesContainer>
        </HiWBox>
        <HiWBox>
          <HiWMainBoxContainer>
            <FileTextOutlined />
            <ContentBoxTitle>Get Reports</ContentBoxTitle>
            <ContentBoxText>
              Get email reports with all the findings
            </ContentBoxText>
          </HiWMainBoxContainer>
          <HiWBoxFeaturesContainer>
            <HiwBoxFeaturesTitle>email reports</HiwBoxFeaturesTitle>
            <FeaturesIconText
              text={"Daily or Weekly"}
              Icon={getReportMediumIcon("email")}
              styleOverride={featuresIconTextStyleOverride}
            />
          </HiWBoxFeaturesContainer>
        </HiWBox>
        <HiWBox>
          <HiWMainBoxContainer>
            <FileSearchOutlined />
            <ContentBoxTitle>Browse the Archives</ContentBoxTitle>
            <ContentBoxText>
              All findings are stored in the archives. They can be browsed in
              the Dashboard
            </ContentBoxText>
          </HiWMainBoxContainer>
          <HiWBoxFeaturesContainer>
            <HiwBoxFeaturesTitle>search features</HiwBoxFeaturesTitle>
            <ContentIconText
              text={"Text-based queries"}
              Icon={<CheckCircleOutlined />}
              styleOverride={featuresIconTextStyleOverride}
            />
            <ContentIconText
              text={"Filter by date, social media, etc"}
              Icon={<CheckCircleOutlined />}
              styleOverride={featuresIconTextStyleOverride}
            />
            <ContentIconText
              text={"Multi-keyword search"}
              Icon={<CheckCircleOutlined />}
              styleOverride={featuresIconTextStyleOverride}
            />
          </HiWBoxFeaturesContainer>
        </HiWBox>
      </HiWContentContainer>
    </SectionContainer>
  );
};
