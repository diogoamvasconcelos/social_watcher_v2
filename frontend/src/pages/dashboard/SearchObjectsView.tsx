import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { User } from "@backend/domain/models/user";
import { SearchObjectDomain } from "@backend/domain/models/userItem";
import { deepmergeSafe } from "@diogovasconcelos/lib";
import { newLowerCase, newPositiveInteger } from "@diogovasconcelos/lib";
import { updateUserSearchObjects } from "../../shared/reducers/userState";
import { useAppDispatch, useAppSelector } from "../../shared/store";
import Text from "antd/lib/typography/Text";
import Switch from "antd/lib/switch";
import Modal from "antd/lib/modal";
import Button from "antd/lib/button";
import SettingFilled from "@ant-design/icons/lib/icons/SettingFilled";
import _range from "lodash/range";
import { capitalizeWord } from "../../shared/lib/text";
import Radio, { RadioChangeEvent } from "antd/lib/radio";
import Input from "antd/lib/input";

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
    instagram: { enabledStatus: "DISABLED" },
    youtube: { enabledStatus: "DISABLED" },
  },
  notificationData: {
    discord: {
      enabledStatus: "DISABLED",
      channel: "add channel id",
      bot: {
        credentials: {
          token: "add bot token",
        },
      },
    },
    slack: {
      enabledStatus: "DISABLED",
      channel: "add channel id",
      bot: {
        credentials: {
          token: "add bot token",
        },
      },
    },
  },
  reportData: {
    email: {
      status: "DISABLED",
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
  const [configNotificationsModalVisible, setNotificationsConfigModalVisible] =
    useState(false);
  const [configNotificationsModalLoading, setConfigNotificationsModalLoading] =
    useState(false);
  const [updatedDiscordConfig, setUpdatedDiscordConfig] = useState<
    SearchObjectDomain["notificationData"]["discord"]
  >(searchObject.notificationData.discord);
  const [updatedSlackConfig, setUpdatedSlackConfig] = useState<
    SearchObjectDomain["notificationData"]["slack"]
  >(searchObject.notificationData.slack);

  const [configReportsModalVisible, setReportsConfigModalVisible] =
    useState(false);
  const [configReportsModalLoading, setConfigReportsModalLoading] =
    useState(false);
  const [updatedEmailConfig, setUpdatedEmailConfig] = useState<
    SearchObjectDomain["reportData"]["email"]
  >(searchObject.reportData.email);

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

  const handleInstagramSwitchedChanged = (val: boolean) => {
    void dispatch(
      updateUserSearchObjects([
        searchObject.index,
        deepmergeSafe(searchObject, {
          searchData: {
            instagram: { enabledStatus: val ? "ENABLED" : "DISABLED" },
          },
        }),
      ])
    );
  };

  const handleYoutubeSwitchedChanged = (val: boolean) => {
    void dispatch(
      updateUserSearchObjects([
        searchObject.index,
        deepmergeSafe(searchObject, {
          searchData: {
            youtube: { enabledStatus: val ? "ENABLED" : "DISABLED" },
          },
        }),
      ])
    );
  };

  // +++++++++++
  // + Discord +
  // +++++++++++
  const handleNotificationsConfigOk = () => {
    setConfigNotificationsModalLoading(true);
    void dispatch(
      updateUserSearchObjects([
        searchObject.index,
        deepmergeSafe(searchObject, {
          notificationData: {
            discord: updatedDiscordConfig,
            slack: updatedSlackConfig,
          },
        }),
      ])
    );
  };
  const handleNotificationsConfigCancel = () => {
    setNotificationsConfigModalVisible(false);
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

  // + EMAIL

  const handleReportsConfigOk = () => {
    setConfigReportsModalLoading(true);
    void dispatch(
      updateUserSearchObjects([
        searchObject.index,
        deepmergeSafe(searchObject, {
          reportData: {
            email: updatedEmailConfig,
          },
        }),
      ])
    );
  };
  const handleReportsConfigCancel = () => {
    setReportsConfigModalVisible(false);
  };

  useEffect(() => {
    if (userFetchStatus === "idle" && configNotificationsModalVisible) {
      setConfigNotificationsModalLoading(false);
      setNotificationsConfigModalVisible(false);
    }
  }, [userFetchStatus]);

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
        <Text>instagram</Text>
        <Switch
          defaultChecked
          checked={
            searchObject.searchData.instagram.enabledStatus === "ENABLED"
          }
          onChange={handleInstagramSwitchedChanged}
        />
      </RowDiv>
      <RowDiv>
        <Text>youtube</Text>
        <Switch
          defaultChecked
          checked={searchObject.searchData.youtube.enabledStatus === "ENABLED"}
          onChange={handleYoutubeSwitchedChanged}
        />
      </RowDiv>
      <RowDiv>
        <Text>Notifications:</Text>
        <Button
          type="default"
          shape="circle"
          icon={<SettingFilled />}
          size="small"
          onClick={() => setNotificationsConfigModalVisible(true)}
        />
      </RowDiv>
      <RowDiv>
        <Text>Discord:</Text>
        <Text>
          {capitalizeWord(searchObject.notificationData.discord.enabledStatus)}
        </Text>
      </RowDiv>
      <RowDiv>
        <Text>Slack:</Text>
        <Text>
          {capitalizeWord(searchObject.notificationData.slack.enabledStatus)}
        </Text>
      </RowDiv>
      <Modal
        title="Notifications"
        visible={configNotificationsModalVisible}
        onOk={handleNotificationsConfigOk}
        confirmLoading={configNotificationsModalLoading}
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
      <RowDiv>
        <Text>Reports:</Text>
        <Button
          type="default"
          shape="circle"
          icon={<SettingFilled />}
          size="small"
          onClick={() => setReportsConfigModalVisible(true)}
        />
      </RowDiv>
      <RowDiv>
        <Text>Email:</Text>
        <Text>{capitalizeWord(searchObject.reportData.email.status)}</Text>
      </RowDiv>
      <Modal
        title="Reports"
        visible={configReportsModalVisible}
        onOk={handleReportsConfigOk}
        confirmLoading={configReportsModalLoading}
        onCancel={handleReportsConfigCancel}
      >
        <RowDiv>
          <Text>Email</Text>
        </RowDiv>
        <RowDiv>
          <Text>Status:</Text>
          <Radio.Group
            onChange={(e: RadioChangeEvent) => {
              setUpdatedEmailConfig(
                deepmergeSafe(updatedEmailConfig, {
                  status: e.target
                    .value as SearchObjectDomain["reportData"]["email"]["status"],
                })
              );
            }}
            value={searchObject.reportData.email.status}
          >
            <Radio value={"DISABLED"}>Disabled</Radio>
            <Radio value={"DAILY"}>Daily</Radio>
            <Radio value={"WEEKLY"}>Weekly</Radio>
          </Radio.Group>
        </RowDiv>
        <RowDiv>
          <Text>Addresses:</Text>
          <Input
            placeholder="enter a valid email to recieve the reports"
            defaultValue={searchObject.reportData.email.addresses?.join(", ")}
          />
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
  const usedIndices = searchObjects.map((searchObject) => searchObject.index);
  const getNextAvailableIndex = () => {
    let freeIndex = newPositiveInteger(0);
    while (usedIndices.includes(freeIndex)) {
      ++freeIndex;
    }
    return freeIndex;
  };
  const emptySearchObjects = _range(
    userNofSearchObjects - searchObjects.length
  ).map((_i) => createEmptySearchObject(getNextAvailableIndex()));

  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      {[...searchObjects, ...emptySearchObjects].map((searchObject) =>
        SearchObjectItem({ searchObject })
      )}
    </div>
  );
};
