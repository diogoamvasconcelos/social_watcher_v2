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
import { ColumnsType, TablePaginationConfig } from "antd/lib/table";
import _ from "lodash";
import { SocialMedia } from "../../../../backend/src/domain/models/socialMedia";
import { toLocalTimestamp } from "../../shared/lib/formatting";

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

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
  const toSocialMediaLabel = (socialMedia: SocialMedia) => {
    switch (socialMedia) {
      case "twitter":
        return "twitter post";
    }
  };

  const columns: ColumnsType<
    Omit<SearchState["items"][0], "socialMedia" | "happenedAt"> & {
      socialMedia: string;
      happenedAt: string;
    }
  > = [
    {
      title: "Social Media",
      dataIndex: "socialMedia",
      render: (text, record) => (
        <a href={record.link} target="_blank">
          {text}
        </a>
      ),
    },
    { title: "Happened at", dataIndex: "happenedAt" },
    { title: "Text", dataIndex: "text" },
    { title: "Language", dataIndex: "lang" },
    { title: "Translated Text", dataIndex: "translatedText" },
  ];

  const paginationConfig: TablePaginationConfig = {
    onChange: (number, pageSize) =>
      console.log(`onChange, number:${number} | pageSize:${pageSize}`),
    defaultPageSize: 25,
    defaultCurrent: 1,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
    pageSizeOptions: ["10", "25", "50", "100"],
    onShowSizeChange: (current, size) =>
      console.log(`onShowSizeChange, number:${current} | pageSize:${size}`),
    showSizeChanger: true,
  };

  return (
    <Table
      columns={columns}
      dataSource={searchResults.items.map((result) => ({
        ...result,
        socialMedia: toSocialMediaLabel(result.socialMedia),
        happenedAt: toLocalTimestamp(result.happenedAt),
        text: result.data.text,
        lang: result.data.lang,
        translatedText: result.data.translatedText ?? "n/a",
      }))}
      pagination={paginationConfig}
      rowKey="id"
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

  const [searchInputEnabled, setSearchInputEnabled] = useState(false);

  const handleSelectKeyword = (val: string) => {
    setKeyword(val);
    setSearchInputEnabled(val != initialKeyword);
  };

  const handleSearchClicked = (val: string) => {
    if (!searchInputEnabled) {
      return;
    }

    void dispatch(
      searchKeyword({
        keyword: newLowerCase(keyword),
        dataQuery: val.length == 0 ? undefined : val,
      })
    );
  };

  return (
    <>
      <SearchWidgetContainer>
        <SearchWidgetHeader>
          <Select
            defaultValue="chose a keyword"
            onChange={handleSelectKeyword}
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
          <Search
            placeholder="search for text"
            style={{ width: 400 }}
            enterButton
            onSearch={handleSearchClicked}
            disabled={!searchInputEnabled}
          ></Search>
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
