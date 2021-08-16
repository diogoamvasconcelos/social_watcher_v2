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
import { PartialDeep } from "type-fest";
import {
  NotificationMedium,
  notificationMediums,
} from "@backend/domain/models/notificationMedium";
import { capitalizeWord } from "../../../../shared/lib/text";

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
            <Text style={{ gridColumnStart: "1" }}>Channel ID</Text>
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
            <Text style={{ gridColumnStart: "1" }}>Bot Token</Text>
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
