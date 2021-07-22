import { SettingFilled } from "@ant-design/icons";
import { Button, Switch, Typography, Modal } from "antd";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { User } from "@backend/domain/models/user";
import { SearchObjectDomain } from "@backend/domain/models/userItem";
import { deepmergeSafe } from "@diogovasconcelos/lib";
import { newLowerCase, newPositiveInteger } from "@diogovasconcelos/lib";
import { updateUserSearchObjects } from "../../shared/reducers/userState";
import { useAppDispatch, useAppSelector } from "../../shared/store";

const { Text } = Typography;

const RowDiv = styled.div`
  display: flex;
  flex-direction: row;
  gap: 4px;
`;

const createEmptySearchObject = (
  index: SearchObjectDomain["index"]
): SearchObjectDomain => ({
  index,
  id: "none",
  type: "SEARCH_OBJECT",
  lockedStatus: "UNLOCKED",
  keyword: newLowerCase("empty - add one"),
  searchData: {
    twitter: { enabledStatus: "DISABLED" },
    reddit: { enabledStatus: "DISABLED", over18: true },
    hackernews: { enabledStatus: "DISABLED" },
  },
  notificationData: {
    discordNotification: {
      enabledStatus: "DISABLED",
      channel: "add channel id",
      bot: {
        credentials: {
          token: "add bot token",
        },
      },
    },
    slackNotification: {
      enabledStatus: "DISABLED",
      channel: "add channel id",
      bot: {
        credentials: {
          token: "add bot token",
        },
      },
    },
  },
});

const SearchObjectItemContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: white;
  width: 300px;
  text-align: center;
`;
type SearchObjectItemProps = {
  searchObject: SearchObjectDomain;
};
const SearchObjectItem: React.FC<SearchObjectItemProps> = ({
  searchObject,
}) => {
  const dispatch = useAppDispatch();
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [configModalLoading, setConfigModalLoading] = useState(false);
  const [updatedDiscordConfig, setUpdatedDiscordConfig] = useState<
    SearchObjectDomain["notificationData"]["discordNotification"]
  >(searchObject.notificationData.discordNotification);
  const [updatedSlackConfig, setUpdatedSlackConfig] = useState<
    SearchObjectDomain["notificationData"]["slackNotification"]
  >(searchObject.notificationData.slackNotification);
  const userFetchStatus = useAppSelector((state) => state.user.fetchStatus);

  const handleKeywordChanged = (val: string) => {
    console.log(`handleKeywordChanged: ${val}`);
    void dispatch(
      updateUserSearchObjects([
        searchObject.index,
        deepmergeSafe(searchObject, { keyword: newLowerCase(val) }),
      ])
    );
  };

  const handleTwitterSwitchedChanged = (val: boolean) => {
    void dispatch(
      updateUserSearchObjects([
        searchObject.index,
        deepmergeSafe(searchObject, {
          searchData: {
            twitter: { enabledStatus: val ? "ENABLED" : "DISABLED" },
          },
        }),
      ])
    );
  };

  const handleRedditSwitchedChanged = (val: boolean) => {
    void dispatch(
      updateUserSearchObjects([
        searchObject.index,
        deepmergeSafe(searchObject, {
          searchData: {
            // TODO: add over18
            reddit: { enabledStatus: val ? "ENABLED" : "DISABLED" },
          },
        }),
      ])
    );
  };

  const handleHackernewsSwitchedChanged = (val: boolean) => {
    void dispatch(
      updateUserSearchObjects([
        searchObject.index,
        deepmergeSafe(searchObject, {
          searchData: {
            hackernews: { enabledStatus: val ? "ENABLED" : "DISABLED" },
          },
        }),
      ])
    );
  };

  // +++++++++
  // + Discord +
  // +++++++++
  const handleNotificationsConfigOk = () => {
    setConfigModalLoading(true);
    void dispatch(
      updateUserSearchObjects([
        searchObject.index,
        deepmergeSafe(searchObject, {
          notificationData: {
            discordNotification: updatedDiscordConfig,
            slackNotification: updatedSlackConfig,
          },
        }),
      ])
    );
  };
  const handleNotificationsConfigCancel = () => {
    setConfigModalVisible(false);
  };
  const handleDiscordNotificationEnabledChanged = (val: boolean) => {
    setUpdatedDiscordConfig(
      deepmergeSafe(updatedDiscordConfig, {
        enabledStatus: val ? "ENABLED" : "DISABLED",
      })
    );
  };
  const handleDiscordNotificationChannelChanged = (val: string) => {
    setUpdatedDiscordConfig(
      deepmergeSafe(updatedDiscordConfig, {
        channel: val,
      })
    );
  };
  const handleDiscordNotificationBotTokenChanged = (val: string) => {
    setUpdatedDiscordConfig(
      deepmergeSafe(updatedDiscordConfig, {
        bot: { credentials: { token: val } },
      })
    );
  };

  // +++++++++
  // + Slack +
  // +++++++++
  const handleSlackNotificationEnabledChanged = (val: boolean) => {
    setUpdatedSlackConfig(
      deepmergeSafe(updatedSlackConfig, {
        enabledStatus: val ? "ENABLED" : "DISABLED",
      })
    );
  };
  const handleSlackNotificationChannelChanged = (val: string) => {
    setUpdatedSlackConfig(
      deepmergeSafe(updatedSlackConfig, {
        channel: val,
      })
    );
  };
  const handleSlackNotificationBotTokenChanged = (val: string) => {
    setUpdatedSlackConfig(
      deepmergeSafe(updatedSlackConfig, {
        bot: { credentials: { token: val } },
      })
    );
  };

  useEffect(() => {
    if (userFetchStatus === "idle" && configModalVisible) {
      setConfigModalLoading(false);
      setConfigModalVisible(false);
    }
  }, [userFetchStatus]);

  useEffect(() => {
    setUpdatedDiscordConfig(searchObject.notificationData.discordNotification);
  }, [searchObject]);

  return (
    <SearchObjectItemContainer key={searchObject.index}>
      <RowDiv>
        <Text strong={true} editable={{ onChange: handleKeywordChanged }}>
          {searchObject.keyword}
        </Text>
      </RowDiv>
      <RowDiv>
        <Text>{searchObject.lockedStatus}</Text>
      </RowDiv>
      <RowDiv>
        <Text>twitter</Text>
        <Switch
          defaultChecked
          checked={searchObject.searchData.twitter.enabledStatus === "ENABLED"}
          onChange={handleTwitterSwitchedChanged}
        />
      </RowDiv>
      <RowDiv>
        <Text>reddit</Text>
        <Switch
          defaultChecked
          checked={searchObject.searchData.reddit.enabledStatus === "ENABLED"}
          onChange={handleRedditSwitchedChanged}
        />
      </RowDiv>
      <RowDiv>
        <Text>hackernews</Text>
        <Switch
          defaultChecked
          checked={
            searchObject.searchData.hackernews.enabledStatus === "ENABLED"
          }
          onChange={handleHackernewsSwitchedChanged}
        />
      </RowDiv>
      <RowDiv>
        <Text>Notifications:</Text>
        <Button
          type="default"
          shape="circle"
          icon={<SettingFilled />}
          size="small"
          onClick={() => setConfigModalVisible(true)}
        />
      </RowDiv>
      <RowDiv>
        <Text>Discord:</Text>
        <Text>
          {searchObject.notificationData.discordNotification.enabledStatus ===
          "ENABLED"
            ? "Enabled"
            : "Disabled"}
        </Text>
      </RowDiv>
      <RowDiv>
        <Text>Slack:</Text>
        <Text>
          {searchObject.notificationData.slackNotification.enabledStatus ===
          "ENABLED"
            ? "Enabled"
            : "Disabled"}
        </Text>
      </RowDiv>
      <Modal
        title="Notifications"
        visible={configModalVisible}
        onOk={handleNotificationsConfigOk}
        confirmLoading={configModalLoading}
        onCancel={handleNotificationsConfigCancel}
      >
        <RowDiv>
          <Text>Discord</Text>
        </RowDiv>
        <RowDiv>
          <p>Enabled</p>
          <Switch
            defaultChecked
            checked={updatedDiscordConfig.enabledStatus === "ENABLED"}
            onChange={handleDiscordNotificationEnabledChanged}
          />
        </RowDiv>
        <RowDiv>
          <p>channel ID</p>
          <Text
            strong={true}
            editable={{ onChange: handleDiscordNotificationChannelChanged }}
          >
            {updatedDiscordConfig.channel}
          </Text>
        </RowDiv>
        <RowDiv>
          <p>Bot token</p>
        </RowDiv>
        <RowDiv>
          <Text
            strong={true}
            editable={{ onChange: handleDiscordNotificationBotTokenChanged }}
          >
            {updatedDiscordConfig.bot.credentials.token}
          </Text>
        </RowDiv>
        <RowDiv>
          <Text>Slack</Text>
        </RowDiv>
        <RowDiv>
          <p>Enabled</p>
          <Switch
            defaultChecked
            checked={updatedSlackConfig.enabledStatus === "ENABLED"}
            onChange={handleSlackNotificationEnabledChanged}
          />
        </RowDiv>
        <RowDiv>
          <p>channel ID</p>
          <Text
            strong={true}
            editable={{ onChange: handleSlackNotificationChannelChanged }}
          >
            {updatedSlackConfig.channel}
          </Text>
        </RowDiv>
        <RowDiv>
          <p>Bot token</p>
        </RowDiv>
        <RowDiv>
          <Text
            strong={true}
            editable={{ onChange: handleSlackNotificationBotTokenChanged }}
          >
            {updatedSlackConfig.bot.credentials.token}
          </Text>
        </RowDiv>
      </Modal>
    </SearchObjectItemContainer>
  );
};

type SearchObjectsViewProps = {
  userNofSearchObjects: User["subscription"]["nofSearchObjects"];
  searchObjects: SearchObjectDomain[];
};
export const SearchObjectsView: React.FC<SearchObjectsViewProps> = ({
  userNofSearchObjects,
  searchObjects,
}) => {
  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      {_.range(userNofSearchObjects).map((i) => {
        let searchObject = searchObjects.find((so) => so.index == i);
        if (!searchObject) {
          searchObject = createEmptySearchObject(newPositiveInteger(i));
        }
        return SearchObjectItem({ searchObject });
      })}
    </div>
  );
};
