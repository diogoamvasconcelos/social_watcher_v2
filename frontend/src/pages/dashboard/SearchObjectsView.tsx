import { SettingFilled } from "@ant-design/icons";
import { Button, Switch, Typography, Modal } from "antd";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { User } from "@backend/domain/models/user";
import { SearchObject } from "@backend/domain/models/userItem";
import { deepmergeSafe } from "@diogovasconcelos/lib";
import { newLowerCase, newPositiveInteger } from "@diogovasconcelos/lib";
import { RenderDynamicWithHooks } from "../../shared/lib/react";
import { updateUserSearchObjects } from "../../shared/reducers/userState";
import { useAppDispatch, useAppSelector } from "../../shared/store";

const { Text } = Typography;

const RowDiv = styled.div`
  display: flex;
  flex-direction: row;
  gap: 4px;
`;

const createEmptySearchObject = (
  index: SearchObject["index"]
): SearchObject => ({
  index,
  id: "none",
  type: "SEARCH_OBJECT",
  lockedStatus: "UNLOCKED",
  keyword: newLowerCase("empty - add one"),
  searchData: { twitter: { enabledStatus: "DISABLED" } },
});

const SearchObjectItemContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: white;
  width: 300px;
  text-align: center;
`;
type SearchObjectItemProps = {
  searchObject: SearchObject;
};
const SearchObjectItem: React.FC<SearchObjectItemProps> = ({
  searchObject,
}) => {
  const dispatch = useAppDispatch();
  const [editingKeyword, setEditingKeyword] = useState(false);
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [configModalLoading, setConfigModalLoading] = useState(false);
  const [updatedDiscordConfig, setUpdatedDiscordConfig] = useState<
    Required<SearchObject["discordNotification"]>
  >(
    searchObject.discordNotification ?? {
      enabled: false,
      channel: "",
      bot: { credentials: { token: "" } },
    }
  );
  const userFetchStatus = useAppSelector((state) => state.user.fetchStatus);

  const handleKeywordChanged = (val: string) => {
    void dispatch(
      updateUserSearchObjects([
        searchObject.index,
        deepmergeSafe(searchObject, { keyword: newLowerCase(val) }),
      ])
    );
    setEditingKeyword(false);
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

  const handleDiscordNotificationConfigOk = () => {
    setConfigModalLoading(true);
    void dispatch(
      updateUserSearchObjects([
        searchObject.index,
        deepmergeSafe(searchObject, {
          discordNotification: updatedDiscordConfig,
        }),
      ])
    );
  };
  const handleDiscordNotificationConfigCancel = () => {
    setConfigModalVisible(false);
  };
  const handleDiscordNotificationEnabledChanged = (val: boolean) => {
    setUpdatedDiscordConfig(
      deepmergeSafe(updatedDiscordConfig, {
        enabled: val,
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

  useEffect(() => {
    if (userFetchStatus === "idle" && configModalVisible) {
      setConfigModalLoading(false);
      setConfigModalVisible(false);
    }
  }, [userFetchStatus]);

  useEffect(() => {
    setUpdatedDiscordConfig(searchObject.discordNotification);
  }, [searchObject]);

  return (
    <SearchObjectItemContainer key={searchObject.index}>
      <RowDiv>
        <Text
          strong={true}
          editable={editingKeyword ? { onChange: handleKeywordChanged } : false}
        >
          {searchObject.keyword}
        </Text>
        <Button
          type="default"
          shape="circle"
          icon={<SettingFilled />}
          size="small"
          onClick={() => setEditingKeyword(true)}
        />
      </RowDiv>
      <RowDiv>
        <Text>{searchObject.lockedStatus}</Text>
      </RowDiv>
      <RowDiv>
        <Text>twitter</Text>
        <Switch
          defaultChecked
          checked={searchObject.searchData.twitter.enabledStatus == "ENABLED"}
          onChange={handleTwitterSwitchedChanged}
        />
      </RowDiv>
      <RowDiv>
        <Text>Notifications:</Text>
        <Text>
          {searchObject.discordNotification?.enabled ? "Discord" : "None"}
        </Text>
        <Button
          type="default"
          shape="circle"
          icon={<SettingFilled />}
          size="small"
          onClick={() => setConfigModalVisible(true)}
        />
      </RowDiv>
      <Modal
        title="Discord Notifications"
        visible={configModalVisible}
        onOk={handleDiscordNotificationConfigOk}
        confirmLoading={configModalLoading}
        onCancel={handleDiscordNotificationConfigCancel}
      >
        <RowDiv>
          <p>Enabled?</p>
          <Switch
            defaultChecked
            checked={updatedDiscordConfig?.enabled}
            onChange={handleDiscordNotificationEnabledChanged}
          />
        </RowDiv>
        <RowDiv>
          <p>channel ID</p>
          <Text
            strong={true}
            editable={{ onChange: handleDiscordNotificationChannelChanged }}
          >
            {updatedDiscordConfig?.channel}
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
            {updatedDiscordConfig?.bot.credentials.token}
          </Text>
        </RowDiv>
      </Modal>
    </SearchObjectItemContainer>
  );
};

type SearchObjectsViewProps = {
  userNofSearchObjects: User["subscription"]["nofSearchObjects"];
  searchObjects: SearchObject[];
};
export const SearchObjectsView: React.FC<SearchObjectsViewProps> = ({
  userNofSearchObjects,
  searchObjects,
}) => {
  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      <RenderDynamicWithHooks>
        {() =>
          _.range(userNofSearchObjects).map((i) => {
            let searchObject = searchObjects.find((so) => so.index == i);
            if (!searchObject) {
              searchObject = createEmptySearchObject(newPositiveInteger(i));
            }
            return SearchObjectItem({ searchObject });
          })
        }
      </RenderDynamicWithHooks>
    </div>
  );
};
