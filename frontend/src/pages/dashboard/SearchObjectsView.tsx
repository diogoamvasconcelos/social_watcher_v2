import { SettingFilled } from "@ant-design/icons";
import { Button, Space, Switch, Typography } from "antd";
import _ from "lodash";
import React, { useState } from "react";
import styled from "styled-components";
import { User } from "../../../../backend/src/domain/models/user";
import { SearchObject } from "../../../../backend/src/domain/models/userItem";
import { deepmergeSafe } from "../../../../backend/src/lib/deepmerge";
import {
  newLowerCase,
  newPositiveInteger,
} from "../../../../backend/src/lib/iots";
import { RenderDynamicWithHooks } from "../../shared/lib/react";
import { updateUserSearchObjects } from "../../shared/reducers/userState";
import { useAppDispatch } from "../../shared/store";

const { Text } = Typography;

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

  return (
    <SearchObjectItemContainer key={searchObject.index}>
      <div style={{ flexDirection: "row" }}>
        <Space>
          <Text
            strong={true}
            editable={
              editingKeyword ? { onChange: handleKeywordChanged } : false
            }
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
        </Space>
      </div>
      <Text>{searchObject.lockedStatus}</Text>
      <div>
        <Space>
          <Text>twitter</Text>
          <Switch
            defaultChecked
            checked={searchObject.searchData.twitter.enabledStatus == "ENABLED"}
            onChange={handleTwitterSwitchedChanged}
          />
        </Space>
      </div>
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
