import React from "react";
import styled from "styled-components";
import { ConfigWidgetProps } from "../SearchObjectConfigPage";
import Text from "antd/lib/typography/Text";
import { SearchObjectDomain } from "@backend/domain/models/userItem";
import Switch from "antd/lib/switch";
import { useAppDispatch } from "../../../../shared/store";
import { updateNotificationData } from "../searchObjectConfigState";
import Divider from "antd/lib/divider";
import { deepmergeSafe } from "@diogovasconcelos/lib/deepmerge";
import { PartialDeep } from "type-fest";
import {
  NotificationMedium,
  notificationMediums,
} from "@backend/domain/models/notificationMedium";
import { capitalizeWord } from "../../../../shared/lib/text";
import Tooltip from "antd/lib/tooltip";
import InfoCircleOutlined from "@ant-design/icons/lib/icons/InfoCircleOutlined";

// ++++++++++
// + WIDGET +
// ++++++++++

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px;
  gap: 8px;
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
      {notificationMediums.map((notificationMedium) => {
        return (
          <div key={notificationMedium}>
            <Divider />
            <NotificationMediumConfigWidget
              notificationMedium={notificationMedium}
              notificationData={searchObject.notificationData}
            />
          </div>
        );
      })}
    </MainContainer>
  );
};

// ++++++++++++++++++++++
// + NotificationMedium +
// ++++++++++++++++++++++

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

const LabelDiv = styled.div`
  grid-column-start: 1;
  display: flex;
  gap: 4px;
  align-items: center;
`;

type NotificationMediumConfigWidgetProps = {
  notificationMedium: NotificationMedium;
  notificationData: SearchObjectDomain["notificationData"];
};

const NotificationMediumConfigWidget: React.FC<NotificationMediumConfigWidgetProps> =
  ({ notificationMedium, notificationData }) => {
    const dispatch = useAppDispatch();

    const dispatchUpdateNotificationData = (
      data: PartialDeep<SearchObjectDomain["notificationData"]>
    ) => {
      dispatch(updateNotificationData(deepmergeSafe(notificationData, data)));
    };

    const handleEnabledChange = (val: boolean) =>
      dispatchUpdateNotificationData({
        [notificationMedium]: { enabledStatus: val ? "ENABLED" : "DISABLED" },
      });

    const handleChannelChanged = (val: string) =>
      dispatchUpdateNotificationData({
        [notificationMedium]: { channel: val },
      });

    const handleBotTokenChanged = (val: string) =>
      dispatchUpdateNotificationData({
        [notificationMedium]: { bot: { credentials: { token: val } } },
      });

    const tooltips = getToolTips(notificationMedium);

    const isEnabled =
      notificationData[notificationMedium].enabledStatus === "ENABLED";

    return (
      <>
        <Text>{capitalizeWord(notificationMedium)}</Text>
        <ConfigContainer>
          <RowDiv>
            <Text style={{ gridColumnStart: "1" }}>Enabled</Text>
            <Switch
              style={{ gridColumnStart: "2", justifySelf: "end" }}
              checked={isEnabled}
              onChange={handleEnabledChange}
            />
          </RowDiv>
          <RowDiv>
            <LabelDiv>
              <Text>Channel ID</Text>
              <Tooltip title={tooltips.channel}>
                <InfoCircleOutlined />
              </Tooltip>
            </LabelDiv>
            <Text
              style={{ gridColumnStart: "2", justifySelf: "end" }}
              strong={true}
              ellipsis={{
                tooltip: notificationData[notificationMedium].channel,
              }}
              editable={isEnabled ? { onChange: handleChannelChanged } : false}
            >
              {notificationData[notificationMedium].channel}
            </Text>
          </RowDiv>
          <RowDiv>
            <LabelDiv>
              <Text>Bot Token</Text>
              <Tooltip title={tooltips.botToken}>
                <InfoCircleOutlined />
              </Tooltip>
            </LabelDiv>
            <Text
              style={{
                gridColumnStart: "2",
                justifySelf: "end",
                width: "300px",
              }}
              strong={true}
              ellipsis={{
                tooltip:
                  notificationData[notificationMedium].bot.credentials.token,
              }}
              editable={isEnabled ? { onChange: handleBotTokenChanged } : false}
            >
              {notificationData[notificationMedium].bot.credentials.token}
            </Text>
          </RowDiv>
        </ConfigContainer>
      </>
    );
  };

const getToolTips = (
  notificationMedium: NotificationMedium
): { channel: string; botToken: string } => {
  switch (notificationMedium) {
    case "discord":
      return {
        channel:
          "To find the Channel ID, right-click on the required channel name in the left sidebar and click on 'Copy ID' (you must enable Developer Mode on Discord's User Settings). Remember to add the bot to the channel as member.",
        botToken:
          "Get the token from the Discord Developers page > Your app > OAuth2 > Client Secret.",
      };
    case "slack":
      return {
        channel:
          "To find the Channel ID, right-click on the required channel name in the left sidebar and click 'Open channel details' and you will find the 'Channel ID' at the bottom. Remember to add the bot to the channel using an '@' mention.",
        botToken:
          "Go to 'https://api.slack.com/apps', select your App > OAuth & Permissions > Bot User OAuth Token (starts with 'xoxb' or 'xoxp'). Also, remember to enable the 'chat:write' User Token Scope on that same page.",
      };
  }
};
