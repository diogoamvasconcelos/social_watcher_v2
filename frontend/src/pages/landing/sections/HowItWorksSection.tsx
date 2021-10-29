import React from "react";
import styled from "styled-components";
import { SectionContainer, SectionContentContainer } from "./shared";
import Text from "antd/lib/typography/Text";
import SearchOutlined from "@ant-design/icons/lib/icons/SearchOutlined";
import NotificationOutlined from "@ant-design/icons/lib/icons/NotificationOutlined";
import FileTextOutlined from "@ant-design/icons/lib/icons/FileTextOutlined";
import FileSearchOutlined from "@ant-design/icons/lib/icons/FileSearchOutlined";

const HiWContainer = styled(SectionContainer)`
  background: aliceblue;
`;

const HiWContentContainer = styled(SectionContentContainer)``;

const HiWBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  align-items: center;
  text-align: center;
  width: 200px;
`;

const HiWBoxTitle = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;
  font-size: 20px;
`;

export const HowItWorksSection: React.FC = () => {
  return (
    <HiWContainer>
      <Text> How it works</Text>
      <HiWContentContainer>
        <HiWBox>
          <HiWBoxTitle>
            <SearchOutlined />
            <Text>Search</Text>
          </HiWBoxTitle>
          <Text>
            The Social Watcher is always* searching the many social medias for
            your selected "keywords"
          </Text>
        </HiWBox>
        <HiWBox>
          <HiWBoxTitle>
            <NotificationOutlined />
            <Text>Notify</Text>
          </HiWBoxTitle>
          <Text>
            When it finds any relevant data, it sends you a notification right
            away
          </Text>
        </HiWBox>
        <HiWBox>
          <HiWBoxTitle>
            <FileTextOutlined />
            <Text>Report</Text>
          </HiWBoxTitle>
          <Text>
            You can also get daily or even weekly reports with the summary all
            of findings
          </Text>
        </HiWBox>
        <HiWBox>
          <HiWBoxTitle>
            <FileSearchOutlined />
            <Text>Archive</Text>
          </HiWBoxTitle>
          <Text>
            All these data is also stored in the "archives", which can be
            accessed and searched through the Dashboard
          </Text>
        </HiWBox>
      </HiWContentContainer>
    </HiWContainer>
  );
};
