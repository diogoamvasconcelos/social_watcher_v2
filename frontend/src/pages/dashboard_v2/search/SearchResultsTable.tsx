import { SocialMedia, socialMedias } from "@backend/domain/models/socialMedia";
import { searchKeyword, SearchState } from "./searchState";
import Table, { ColumnsType, TablePaginationConfig } from "antd/lib/table";
import styled from "styled-components";
import { SearchObjectDomain } from "@backend/domain/models/userItem";
import { useAppDispatch, useAppSelector } from "../../../shared/store";
import React, { useState } from "react";
import { newLowerCase } from "@diogovasconcelos/lib";
import { toLocalTimestamp } from "../../../shared/lib/formatting";
import { SearchResult } from "@backend/domain/models/searchResult";
import Select from "antd/lib/select";
import Search from "antd/lib/input/Search";
import { Keyword } from "@backend/domain/models/keyword";
import DatePicker, { RangePickerProps } from "antd/lib/date-picker";
import { useEffect } from "react";

const { Option } = Select;
const { RangePicker } = DatePicker;

// +++++++++++++
// + CONTAINER +
// +++++++++++++

const TableContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: white;
`;
type SearchResultsTableProps = {
  searchObjects: SearchObjectDomain[];
};
export const SearchResultsTable: React.FC<SearchResultsTableProps> = ({
  searchObjects,
}) => {
  const searchResult = useAppSelector((state) => state.search);

  const [isSearcing, setIsSearching] = useState(false);

  useEffect(() => {
    // hacky way to know how when the search has ended...probably worth improving
    setIsSearching(false);
  }, [searchResult]);

  return (
    <>
      <TableContainer>
        <TableHeader
          searchObjects={searchObjects}
          onSearch={() => {
            setIsSearching(true);
          }}
        />
        <ResultsTable searchResults={searchResult} loading={isSearcing} />
      </TableContainer>
    </>
  );
};

// +++++++++
// + TABLE +
// +++++++++

type SearchTableProps = {
  searchResults: SearchState;
  loading: boolean;
};
const ResultsTable: React.FC<SearchTableProps> = ({
  searchResults,
  loading,
}) => {
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
    position: ["topRight", "bottomRight"],
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
      loading={loading}
    />
  );
};

// ++++++++++
// + HEADER +
// ++++++++++

const TableHeaderContainer = styled.div`
  flex-direction: row;
`;

type TableHeaderProps = {
  searchObjects: SearchObjectDomain[];
  onSearch: () => void;
};

const TableHeader: React.FC<TableHeaderProps> = ({
  searchObjects,
  onSearch,
}) => {
  const dispatch = useAppDispatch();
  const initialKeyword = "chose a keyword";
  const [keyword, setKeyword] = useState(initialKeyword);

  const [searchInputEnabled, setSearchInputEnabled] = useState(false);

  // TODO: allow search for multiple keywords
  const handleSelectKeyword = (val: string) => {
    setKeyword(val);
    setSearchInputEnabled(val != initialKeyword);
  };

  const handleSelectFilterSocialMedia = (vals: string[]) => {
    // TODO: decode to SocialMedia type
    // TODO: propagate state changes (once this feature is possible on the backend)
    console.log(`selected filter socialMedia: ${vals}`);
  };

  const handleRangePickerChanged: RangePickerProps["onChange"] = (
    _dates,
    dateStrings
  ) => {
    // TODO: propagate state changes
    console.log(dateStrings);
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

    onSearch();
  };

  const allowedKeywords: Keyword[] = searchObjects
    .filter((searchObject) => searchObject.lockedStatus == "UNLOCKED")
    .map((searchObject) => searchObject.keyword);

  const allowedSocialMedias: SocialMedia[] = socialMedias;

  return (
    <TableHeaderContainer>
      <Select
        defaultValue="chose a keyword"
        onChange={handleSelectKeyword}
        style={{ minWidth: 200 }}
      >
        {allowedKeywords.map((keyword) => (
          <Option value={keyword} key={keyword}>
            {keyword}
          </Option>
        ))}
      </Select>
      <Select
        placeholder="all social media"
        mode="multiple"
        allowClear
        onChange={handleSelectFilterSocialMedia}
        style={{ minWidth: 200 }}
      >
        {allowedSocialMedias.map((socialMedia) => (
          <Option value={socialMedia} key={socialMedia}>
            {socialMedia}
          </Option>
        ))}
      </Select>
      <RangePicker
        format="YYYY-MM-DD HH:mm"
        showTime={true}
        allowEmpty={[true, true]}
        onChange={handleRangePickerChanged}
      />
      <Search
        placeholder="search for  text"
        style={{ width: 400 }}
        enterButton
        onSearch={handleSearchClicked}
        disabled={!searchInputEnabled}
      ></Search>
    </TableHeaderContainer>
  );
};

// ++++++++
// + ITEM +
// ++++++++

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
