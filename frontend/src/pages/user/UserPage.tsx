import React, { useEffect, useState } from "react";
import {
  getUserDetails,
  getUserSearchObjects,
  updateUserSearchObjects,
} from "../../shared/reducers/userState";
import { useAppDispatch, useAppSelector } from "../../shared/store";
import { JSONViewer } from "../../shared/components/JSONViewer";
import { Typography, Button, Input, Select, Space, Switch, Table } from "antd";
import { SettingFilled } from "@ant-design/icons";
import { SearchObject } from "../../../../backend/src/domain/models/userItem";
import styled from "styled-components";
import { searchKeyword, SearchState } from "./searchState";
import {
  newLowerCase,
  newPositiveInteger,
} from "../../../../backend/src/lib/iots";
import { deepmergeSafe } from "../../../../backend/src/lib/deepmerge";
import { RenderDynamicWithHooks } from "../../shared/lib/react";
import { ColumnsType } from "antd/lib/table";
import _ from "lodash";

const { Title, Text } = Typography;
const { Option } = Select;

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

type SearchTableProps = {
  searchResults: SearchState;
};
const SearchTable: React.FC<SearchTableProps> = ({ searchResults }) => {
  const columns: ColumnsType<SearchState["items"][0]> = [
    {
      title: "Social Media",
      dataIndex: "socialMedia",
      key: "socialMedia",
      render: (text, record) => <a href={record.link}>{text}</a>,
    },
    { title: "Happened at", dataIndex: "happenedAt", key: "happenedAt" },
    { title: "Text", dataIndex: "text", key: "text" },
    { title: "Language", dataIndex: "lang", key: "lang" },
    { title: "Translated Text", dataIndex: "translatedText" },
  ];

  return (
    <Table
      columns={columns}
      dataSource={searchResults.items.map((result) => ({
        ...result,
        text: result.data.text,
        lang: result.data.lang,
        translatedText: result.data.translatedText ?? "n/a",
      }))}
    />
  );
};

const SearchWidgetContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: white;
`;
const SearchWidgetHeader = styled.div`
  flex-direction: row;
`;
type searchWidgetProps = {
  searchObjects: SearchObject[];
};
const SearchWidget: React.FC<searchWidgetProps> = ({ searchObjects }) => {
  const dispatch = useAppDispatch();
  const searchResult = useAppSelector((state) => state.search);

  const initialKeyword = "chose a keyword";
  const [keyword, setKeyword] = useState(initialKeyword);

  const handleSearchClicked = () => {
    if (keyword == initialKeyword) {
      return;
    }

    void dispatch(
      searchKeyword({
        keyword: newLowerCase(keyword),
      })
    );
  };

  return (
    <>
      <SearchWidgetContainer>
        <SearchWidgetHeader>
          <Select
            defaultValue="chose a keyword"
            onChange={setKeyword}
            style={{ minWidth: 200 }}
          >
            {searchObjects
              .filter((so) => so.lockedStatus == "UNLOCKED")
              .map((so) => (
                <Option value={so.keyword} key={so.index}>
                  {so.keyword}
                </Option>
              ))}
          </Select>
          <Input placeholder="search for text" style={{ width: 400 }}></Input>
          <Button onClick={handleSearchClicked}>Search</Button>
        </SearchWidgetHeader>
        <SearchTable searchResults={searchResult} />
      </SearchWidgetContainer>
    </>
  );
};

export const UserPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.details);
  const searchObjects = useAppSelector((state) => state.user.searchObjects);

  useEffect(() => {
    void dispatch(getUserDetails());
    void dispatch(getUserSearchObjects());
  }, []);

  console.log(searchObjects);

  return (
    <div>
      <div>
        <Title level={4}>User</Title>
        {<JSONViewer name="user" json={user} />}
      </div>
      <Title level={4}>Keywords</Title>
      <div style={{ display: "flex", flexDirection: "row" }}>
        <RenderDynamicWithHooks>
          {() =>
            _.range(user?.nofSearchObjects ?? 0).map((i) => {
              let searchObject = searchObjects.find((so) => so.index == i);
              if (!searchObject) {
                searchObject = createEmptySearchObject(newPositiveInteger(i));
              }
              return SearchObjectItem({ searchObject });
            })
          }
        </RenderDynamicWithHooks>
      </div>
      <div>
        <Title level={4}>Search</Title>
        <SearchWidget searchObjects={searchObjects} />
      </div>
    </div>
  );
};
