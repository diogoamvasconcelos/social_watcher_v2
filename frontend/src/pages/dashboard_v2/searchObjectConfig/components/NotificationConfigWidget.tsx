import React from "react";
import styled from "styled-components";
import { ConfigWidgetProps } from "../SearchObjectConfigPage";
import Text from "antd/lib/typography/Text";
import { SearchObjectDomain } from "@backend/domain/models/userItem";
import Switch from "antd/lib/switch";
import { useAppDispatch } from "../../../../shared/store";
import { updateNotificationData } from "../searchObjectConfigState";
import Divider from "antd/lib/divider";
import { deepmergeSafe } from "@diogovasconcelos/lib";

// ++++++++++
// + WIDGET +
// ++++++++++

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px;
  gap: 8px;
`;

const ConfigContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  border-style: solid;
  border-width: 1px;
  border-radius: 4px;
  padding: 8px 16px;
  max-width: 500px;
`;

const RowDiv = styled.div`
  display: grid;
  grid-template-columns: 100px 1fr;
`;

export const NotificationsConfigWidget: React.FC<ConfigWidgetProps> = ({
  searchObject,
}) => {
  return (
    <MainContainer>
      <Text>Notifications Config</Text>
      <Text code>
        Get notifications in real time whenever a new result has been found
      </Text>
      <Divider />
      <DiscordConfigWidget notificationData={searchObject.notificationData} />
    </MainContainer>
  );
};

// +++++++++++
// + Discord +
// +++++++++++

type DiscordConfigWidgetProps = {
  notificationData: SearchObjectDomain["notificationData"];
};

const DiscordConfigWidget: React.FC<DiscordConfigWidgetProps> = ({
  notificationData,
}) => {
  const dispatch = useAppDispatch();

  const handleEnabledChange = (val: boolean) => {
    dispatch(
      updateNotificationData(
        deepmergeSafe(notificationData, {
          discord: { enabledStatus: val ? "ENABLED" : "DISABLED" },
        })
      )
    );
  };

  const handleChannelChanged = (val: string) => {
    dispatch(
      updateNotificationData(
        deepmergeSafe(notificationData, {
          discord: { channel: val },
        })
      )
    );
  };

  const handleBotTokenChanged = (val: string) => {
    dispatch(
      updateNotificationData(
        deepmergeSafe(notificationData, {
          discord: { bot: { credentials: { token: val } } },
        })
      )
    );
  };

  return (
    <>
      <Text>Discord</Text>
      <ConfigContainer>
        <RowDiv>
          <Text style={{ gridColumnStart: "1" }}>Enabled</Text>
          <Switch
            style={{ gridColumnStart: "2", justifySelf: "end" }}
            checked={notificationData.discord.enabledStatus === "ENABLED"}
            onChange={handleEnabledChange}
          />
        </RowDiv>
        <RowDiv>
          <Text style={{ gridColumnStart: "1" }}>Channel ID</Text>
          <Text
            style={{ gridColumnStart: "2", justifySelf: "end" }}
            strong={true}
            editable={{ onChange: handleChannelChanged }}
          >
            {notificationData.discord.channel}
          </Text>
        </RowDiv>
        <RowDiv>
          <Text style={{ gridColumnStart: "1" }}>Bot Token</Text>
          <Text
            style={{ gridColumnStart: "2", justifySelf: "end", width: "300px" }}
            strong={true}
            ellipsis={{
              tooltip: notificationData.discord.bot.credentials.token,
            }}
            editable={{ onChange: handleBotTokenChanged }}
          >
            {notificationData.discord.bot.credentials.token}
          </Text>
        </RowDiv>
      </ConfigContainer>
    </>
  );
};
