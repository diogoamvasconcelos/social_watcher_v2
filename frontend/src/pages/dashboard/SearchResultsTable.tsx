import { SocialMedia } from "@backend/domain/models/socialMedia";
import { searchKeyword, SearchState } from "./searchState";
import Table, { ColumnsType, TablePaginationConfig } from "antd/lib/table";
import styled from "styled-components";
import { SearchObjectDomain } from "@backend/domain/models/userItem";
import { useAppDispatch, useAppSelector } from "../../shared/store";
import React, { useState } from "react";
import { newLowerCase } from "@diogovasconcelos/lib";
import { toLocalTimestamp } from "../../shared/lib/formatting";
import { SearchResult } from "@backend/domain/models/searchResult";
import Select from "antd/lib/select";
import Input from "antd/lib/input";

const { Option } = Select;
const { Search } = Input;

type SearchTableProps = {
  searchResults: SearchState;
};
const ResultsTable: React.FC<SearchTableProps> = ({ searchResults }) => {
  const toSocialMediaLabel = (socialMedia: SocialMedia) => {
    switch (socialMedia) {
      case "twitter":
        return "twitter message";
      case "reddit":
        return "reddit post";
      case "hackernews":
        return "hackernews post";
      case "instagram":
        return "instagram post";
      case "youtube":
        return "youtube video";
    }
  };

  const getTextFromSearchResult = (searchResult: SearchResult) => {
    switch (searchResult.socialMedia) {
      case "twitter":
        return searchResult.data.text;
      case "reddit":
        return searchResult.data.selftext;
      case "hackernews":
        return searchResult.data.text;
      case "instagram":
        return searchResult.data.caption;
      case "youtube":
        return searchResult.data.title;
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
        text: getTextFromSearchResult(result),
        lang: result.data.lang,
        translatedText: result.data.translatedText ?? "n/a",
      }))}
      pagination={paginationConfig}
      rowKey="id"
    />
  );
};

const ComponentContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: white;
`;
const ComponentHeader = styled.div`
  flex-direction: row;
`;
type SearchResultsTableProps = {
  searchObjects: SearchObjectDomain[];
};
export const SearchResultsTable: React.FC<SearchResultsTableProps> = ({
  searchObjects,
}) => {
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
      searchKeyword([
        {
          keyword: newLowerCase(keyword),
          dataQuery: val.length == 0 ? undefined : val,
        },
      ])
    );
  };

  return (
    <>
      <ComponentContainer>
        <ComponentHeader>
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
        </ComponentHeader>
        <ResultsTable searchResults={searchResult} />
      </ComponentContainer>
    </>
  );
};
