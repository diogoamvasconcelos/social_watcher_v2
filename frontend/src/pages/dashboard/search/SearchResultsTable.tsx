import { SocialMedia, socialMedias } from "@backend/domain/models/socialMedia";
import { searchKeyword, SearchRequestData, SearchState } from "./searchState";
import Table, {
  ColumnsType,
  TablePaginationConfig,
  TableProps,
} from "antd/lib/table";
import styled from "styled-components";
import { SearchObjectDomain } from "@backend/domain/models/userItem";
import { useAppDispatch, useAppSelector } from "../../../shared/store";
import React, { ChangeEvent, useReducer, useState } from "react";
import {
  newDateISOString,
  newLowerCase,
  newPositiveInteger,
} from "@diogovasconcelos/lib";
import { toLocalTimestamp } from "../../../shared/lib/formatting";
import { SearchResult } from "@backend/domain/models/searchResult";
import Select from "antd/lib/select";
import { Keyword } from "@backend/domain/models/keyword";
import DatePicker, { RangePickerProps } from "antd/lib/date-picker";
import { useEffect } from "react";
import Button from "antd/lib/button";
import SearchOutlined from "@ant-design/icons/lib/icons/SearchOutlined";
import Text from "antd/lib/typography/Text";
import Input from "antd/lib/input";
import { AnyAction, createAction, createReducer } from "@reduxjs/toolkit";

const { Option } = Select;
const { RangePicker } = DatePicker;

// +++++++++
// + STATE +
// +++++++++

type SearchRequestState = SearchRequestData;
const searchRequestInitialState: SearchRequestState = {
  keyword: newLowerCase(""),
  pagination: {
    limit: newPositiveInteger(20),
    offset: newPositiveInteger(0),
  },
};

const changeKeywordAction =
  createAction<SearchRequestState["keyword"]>("CHANGE_KEYWORD");
const changeDataQueryAction =
  createAction<SearchRequestState["dataQuery"]>("CHANGE_DATA_QUERY");
const changeTimeQueryAction =
  createAction<SearchRequestState["timeQuery"]>("CHANGE_TIME_QUERY");
const changePaginationAction =
  createAction<SearchRequestState["pagination"]>("CHANGE_PAGINATION");

const searchRequestStateReducer = createReducer<SearchRequestState>(
  searchRequestInitialState,
  (builder) => {
    builder
      .addCase(changeKeywordAction, (state, action) => {
        state.keyword = action.payload;
      })
      .addCase(changeDataQueryAction, (state, action) => {
        state.dataQuery = action.payload;
      })
      .addCase(changeTimeQueryAction, (state, action) => {
        state.timeQuery = action.payload;
      })
      .addCase(changePaginationAction, (state, action) => {
        state.pagination = action.payload;
      });
  }
);

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
  const dispatch = useAppDispatch();
  const searchResult = useAppSelector((state) => state.search);
  const [isSearcing, setIsSearching] = useState(false);

  const [searchRequestState, dispatchSearchRequestStateAction] = useReducer(
    searchRequestStateReducer,
    searchRequestInitialState
  );

  useEffect(() => {
    // hacky way to know how when the search has ended...probably worth improving
    setIsSearching(false);
  }, [searchResult]);

  const dispatchSearch = () => {
    if (searchRequestState.keyword.length > 0) {
      setIsSearching(true);
      void dispatch(searchKeyword(searchRequestState));
    }
  };

  const handleOnSearchRequested = () => {
    dispatchSearch();
  };

  useEffect(() => {
    // hacky way to search when table pagination changes
    dispatchSearch();
  }, [searchRequestState.pagination]);

  return (
    <>
      <TableContainer>
        <TableHeader
          searchObjects={searchObjects}
          onSearch={handleOnSearchRequested}
          searchRequestState={searchRequestState}
          dispatchSearchRequestStateAction={dispatchSearchRequestStateAction}
        />
        <ResultsTable
          searchResults={searchResult}
          loading={isSearcing}
          searchRequestState={searchRequestState}
          dispatchSearchRequestStateAction={dispatchSearchRequestStateAction}
        />
      </TableContainer>
    </>
  );
};

// +++++++++
// + TABLE +
// +++++++++

type TableRecord = Omit<
  SearchState["items"][0],
  "socialMedia" | "happenedAt"
> & {
  socialMedia: string;
  happenedAt: string;
};

type SearchTableProps = {
  searchResults: SearchState;
  loading: boolean;
  searchRequestState: SearchRequestState;
  dispatchSearchRequestStateAction: React.Dispatch<AnyAction>;
};
const ResultsTable: React.FC<SearchTableProps> = ({
  searchResults,
  loading,
  searchRequestState,
  dispatchSearchRequestStateAction,
}) => {
  const columns: ColumnsType<TableRecord> = [
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

  const handleTableChange: TableProps<TableRecord>["onChange"] = (
    pagination,
    _filters,
    _sorter
  ) => {
    const pageSize = pagination.pageSize ?? 0;
    const current = pagination.current ?? 1;

    const offset = newPositiveInteger((current - 1) * pageSize);
    const limit = newPositiveInteger(pageSize);
    dispatchSearchRequestStateAction(changePaginationAction({ offset, limit }));
  };

  const paginationConfig: TablePaginationConfig = {
    defaultCurrent: 1,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
    pageSizeOptions: ["10", "20", "50", "100"],
    showSizeChanger: true,
    position: ["topRight", "bottomRight"],
    current: searchRequestState.pagination
      ? searchRequestState.pagination.offset /
          searchRequestState.pagination.limit +
        1
      : 1,
    pageSize: searchRequestState.pagination?.limit,
    total: searchResults.pagination.total,
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
      onChange={handleTableChange}
    />
  );
};

// ++++++++++
// + HEADER +
// ++++++++++

const TableHeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 8px 8px;
  max-width: 600px;
`;

const TableHeaderRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;
`;

type TableHeaderProps = {
  searchObjects: SearchObjectDomain[];
  onSearch: () => void;
  searchRequestState: SearchRequestState; // not used atm
  dispatchSearchRequestStateAction: React.Dispatch<AnyAction>;
};

const TableHeader: React.FC<TableHeaderProps> = ({
  searchObjects,
  onSearch,
  dispatchSearchRequestStateAction,
}) => {
  const initialKeyword = "choose a keyword";

  const [searchEnabled, setSearchEnabled] = useState(false);

  // TODO: allow search for multiple keywords
  const handleSelectKeyword = (val: string) => {
    dispatchSearchRequestStateAction(changeKeywordAction(newLowerCase(val)));
    setSearchEnabled(val != initialKeyword);
  };

  const handleSelectFilterSocialMedia = (vals: string[]) => {
    // TODO: decode to SocialMedia type
    // TODO: propagate state changes (once this feature is possible on the backend)
    console.log(`selected filter socialMedia: ${vals}`);
  };

  const handleRangePickerChanged: RangePickerProps["onChange"] = (
    _dates,
    [startDate, endDate]
  ) => {
    dispatchSearchRequestStateAction(
      changeTimeQueryAction({
        happenedAtStart: startDate ? newDateISOString(startDate) : undefined,
        happenedAtEnd: endDate ? newDateISOString(endDate) : undefined,
      })
    );
  };

  const handleSearchTextChanged = (event: ChangeEvent<HTMLInputElement>) => {
    const val = event.target.value;

    dispatchSearchRequestStateAction(changeDataQueryAction(val || undefined));
  };

  const handleSearchClicked = () => {
    if (!searchEnabled) {
      return;
    }

    onSearch();
  };

  const allowedKeywords: Keyword[] = searchObjects
    .filter((searchObject) => searchObject.lockedStatus == "UNLOCKED")
    .map((searchObject) => searchObject.keyword);

  const allowedSocialMedias: SocialMedia[] = socialMedias;

  return (
    <TableHeaderContainer>
      <TableHeaderRow>
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
        <Button
          type="primary"
          style={{ width: "60px", height: "100%", borderRadius: "4px" }}
          icon={<SearchOutlined />}
          size="small"
          onClick={handleSearchClicked}
          disabled={!searchEnabled}
        />
      </TableHeaderRow>
      <TableHeaderRow>
        <Text>Filters</Text>
      </TableHeaderRow>
      <Input
        placeholder="search for specific text"
        allowClear={true}
        // enterButton
        // onSearch={handleSearchClicked}
        onChange={handleSearchTextChanged}
      />
      <Select
        placeholder="all social media"
        mode="multiple"
        allowClear
        onChange={handleSelectFilterSocialMedia}
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
        style={{ width: "240px" }}
      />
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
