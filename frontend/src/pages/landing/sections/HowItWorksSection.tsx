import React from "react";
import styled from "styled-components";
import { SectionContainer, SectionContentContainer } from "./shared";
import { socialMedias } from "@backend/domain/models/socialMedia";
import { capitalizeWord } from "@src/shared/lib/text";
import {
  getNotificationMediumIcon,
  getReportMediumIcon,
  getSocialMediaIcon,
} from "@src/shared/components/Icons";
import { notificationMediums } from "@backend/domain/models/notificationMedium";
import { reportMediums } from "@backend/domain/models/reportMedium";
import Text from "antd/lib/typography/Text";

const HiWContainer = styled(SectionContainer)`
  background: aliceblue;
`;

const HiWContentContainer = styled(SectionContentContainer)`
  gap: 100px;
`;

const HiWBox = styled.div`
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

export const HowItWorksSection: React.FC = () => {
  return (
    <HiWContainer>
      <Text> How it works</Text>
      <HiWContentContainer>
        <HiWBox>
          <Text>Social Media Platforms</Text>
          {socialMedias.map((socialMedia) => (
            <HiWListItem
              text={capitalizeWord(socialMedia)}
              Icon={getSocialMediaIcon(socialMedia)}
              key={socialMedia}
            />
          ))}
        </HiWBox>
        <HiWBox>
          <Text>Notification Platforms</Text>
          {notificationMediums.map((notificationMedium) => (
            <HiWListItem
              text={capitalizeWord(notificationMedium)}
              Icon={getNotificationMediumIcon(notificationMedium)}
              key={notificationMedium}
            />
          ))}
          {reportMediums.map((reportMedium) => (
            <HiWListItem
              text={capitalizeWord(reportMedium)}
              Icon={getReportMediumIcon(reportMedium)}
              key={reportMedium}
            />
          ))}
        </HiWBox>
      </HiWContentContainer>
    </HiWContainer>
  );
};

const HiWListItemContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 4px;
  align-items: center;
`;

const HiWListItem: React.FC<{ text: string; Icon: React.ReactNode }> = ({
  text,
  Icon,
}) => {
  return (
    <HiWListItemContainer>
      {Icon}
      <Text>{text}</Text>
    </HiWListItemContainer>
  );
};
