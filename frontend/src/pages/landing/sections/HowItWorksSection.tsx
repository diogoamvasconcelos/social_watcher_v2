import React from "react";
import styled from "styled-components";
import {
  SectionContainer,
  SectionContentContainer,
  SectionTitle,
  ContentBox,
  ContentBoxTitle,
  ContentBoxText,
} from "./shared";
import binocularIcon from "../../../../assets/binocular-outline.svg";
import NotificationOutlined from "@ant-design/icons/lib/icons/NotificationOutlined";
import FileTextOutlined from "@ant-design/icons/lib/icons/FileTextOutlined";
import FileSearchOutlined from "@ant-design/icons/lib/icons/FileSearchOutlined";
import { colors } from "@src/shared/style/colors";
import { size } from "@src/shared/style/sizing";
import { boxDropShadow, boxRoundBorder } from "@src/shared/style/box";
import Icon from "@ant-design/icons/lib/components/Icon";

const HiWContentContainer = styled(SectionContentContainer)``;

const HiWBox = styled(ContentBox)`
  ${boxDropShadow}
  ${boxRoundBorder}
  background-color: ${colors.neutral.light2};

  & .anticon {
    font-size: ${size.size64px};
    color: ${colors.neutral.dark2};
  }
`;

export const HowItWorksSection: React.FC = () => {
  return (
    <SectionContainer>
      <SectionTitle style={{ color: colors.neutral.light2 }}>
        How it works
      </SectionTitle>
      <HiWContentContainer>
        <HiWBox>
          <Icon component={binocularIcon} />
          <ContentBoxTitle>Automatic Search</ContentBoxTitle>
          <ContentBoxText>
            The Social Watcher regularly searches social media for your selected
            keywords
          </ContentBoxText>
        </HiWBox>
        <HiWBox>
          <NotificationOutlined />
          <ContentBoxTitle>Get Notifications</ContentBoxTitle>
          <ContentBoxText>
            When it finds any relevant data, it sends you a notification right
            away
          </ContentBoxText>
        </HiWBox>
        <HiWBox>
          <FileTextOutlined />
          <ContentBoxTitle>Get Reports</ContentBoxTitle>
          <ContentBoxText>
            Get daily or weekly reports with all the findings
          </ContentBoxText>
        </HiWBox>
        <HiWBox>
          <FileSearchOutlined />
          <ContentBoxTitle>Browse the Archives</ContentBoxTitle>
          <ContentBoxText>
            All findings are stored in the "archives", which can be viewed
            through the Dashboard
          </ContentBoxText>
        </HiWBox>
      </HiWContentContainer>
    </SectionContainer>
  );
};
