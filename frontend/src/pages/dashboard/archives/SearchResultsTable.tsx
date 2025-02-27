import {
  SocialMedia,
  socialMediaCodec,
  socialMedias,
} from "@backend/domain/models/socialMedia";
import { searchKeyword, SearchState } from "./searchState";
import Table, {
  ColumnsType,
  TablePaginationConfig,
  TableProps,
} from "antd/lib/table";
import styled from "styled-components";
import { SearchObjectDomain } from "@backend/domain/models/userItem";
import { useAppDispatch, useAppSelector } from "../../../shared/store";
import React, { ChangeEvent, useState } from "react";
import { toLocalTimestamp } from "../../../shared/lib/formatting";
import { SearchResult } from "@backend/domain/models/searchResult";
import Select from "antd/lib/select";
import { Keyword, keywordCodec } from "@backend/domain/models/keyword";
import DatePicker, { RangePickerProps } from "antd/lib/date-picker";
import { useEffect, useReducer } from "react";
import SearchOutlined from "@ant-design/icons/lib/icons/SearchOutlined";
import Text from "antd/lib/typography/Text";
import Input from "antd/lib/input";
import { AnyAction } from "@reduxjs/toolkit";
import { SearchRequestState, updateSearchRequestAction } from "./ArchivesPage";
import {
  decode,
  fromEither,
  newDateISOString,
  newLowerCase,
  newPositiveInteger,
  toSingleEither,
} from "@diogovasconcelos/lib/iots";
import { isNonEmpty } from "fp-ts/lib/Array";
import { momentOrNull } from "@src/shared/lib/moment";
import { createAction, createReducer } from "@reduxjs/toolkit";
import { deepmergeSafe } from "@diogovasconcelos/lib/deepmerge";
import { clampText } from "@src/shared/lib/text";
import { PrimaryButton } from "@src/shared/style/components/button";

const { Option } = Select;
const { RangePicker } = DatePicker;

// +++++++++
// + STATE +
// +++++++++

type TableConfigState = {
  posts: {
    text: "ONLY_ORIGINAL" | "ONLY_TRANSLATION" | "BOTH";
  };
};
const tableConfigInitialState: TableConfigState = {
  posts: {
    text: "BOTH",
  },
};

const updateTableConfigPostsText =
  createAction<TableConfigState["posts"]["text"]>("UPDATE_POSTS_TEXT");

const tableConfigStateReducer = createReducer<TableConfigState>(
  tableConfigInitialState,
  (builder) => {
    builder.addCase(updateTableConfigPostsText, (state, action) => {
      return deepmergeSafe(state, { posts: { text: action.payload } });
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
  searchRequestState: SearchRequestState;
  dispatchSearchRequestStateAction: React.Dispatch<AnyAction>;
};
export const SearchResultsTable: React.FC<SearchResultsTableProps> = ({
  searchObjects,
  searchRequestState,
  dispatchSearchRequestStateAction,
}) => {
  const dispatch = useAppDispatch();
  const searchResult = useAppSelector((state) => state.search);
  const [searchEnabled, setSearchEnabled] = useState(false);
  const [tableConfigState, dispatchTableConfigStateAction] = useReducer(
    tableConfigStateReducer,
    tableConfigInitialState
  );

  const dispatchSearch = () => {
    if (searchEnabled && searchRequestState.keywords) {
      void dispatch(searchKeyword([searchRequestState]));
    }
  };

  useEffect(() => {
    if (searchRequestState.keywords == undefined) {
      setSearchEnabled(false);
      return;
    }

    // search only enabled if all selected keywords are valid
    setSearchEnabled(
      searchRequestState.keywords.every((keyword) =>
        searchObjects
          .map((searchObject) => searchObject.keyword)
          .includes(newLowerCase(keyword ?? ""))
      )
    );
  }, [searchRequestState.keywords, searchObjects]);

  useEffect(() => {
    // hacky way to search when table pagination changes
    dispatchSearch();
  }, [searchRequestState.pagination, searchEnabled]);

  const isSearching = searchResult.status === "PENDING";

  return (
    <>
      <TableContainer>
        <TableHeader
          searchObjects={searchObjects}
          onSearch={dispatchSearch}
          searchRequestState={searchRequestState}
          dispatchSearchRequestStateAction={dispatchSearchRequestStateAction}
          searchEnabled={searchEnabled}
          tableConfigState={tableConfigState}
          dispatchTableConfigStateAction={dispatchTableConfigStateAction}
          isSearching={isSearching}
        />
        <ResultsTable
          searchResults={searchResult}
          loading={isSearching}
          searchRequestState={searchRequestState}
          dispatchSearchRequestStateAction={dispatchSearchRequestStateAction}
          tableConfigState={tableConfigState}
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
  fullText: string;
};

type SearchTableProps = {
  searchResults: SearchState;
  loading: boolean;
  searchRequestState: SearchRequestState;
  dispatchSearchRequestStateAction: React.Dispatch<AnyAction>;
  tableConfigState: TableConfigState;
};
const ResultsTable: React.FC<SearchTableProps> = ({
  searchResults,
  loading,
  searchRequestState,
  dispatchSearchRequestStateAction,
  tableConfigState: { posts: postsConfig },
}) => {
  const columns: ColumnsType<TableRecord> = [
    {
      title: "Social Media",
      dataIndex: "socialMedia",
      render: (text: string, record: TableRecord) => (
        <a href={record.link} target="_blank">
          {text}
        </a>
      ),
    },
    { title: "Happened at", dataIndex: "happenedAt" },
    { title: "Text", dataIndex: "text" },
    { title: "Language", dataIndex: "lang" },
    { title: "Translated Text", dataIndex: "translatedText" },
  ].filter((column) => {
    switch (column.dataIndex) {
      case "text":
        return (
          postsConfig.text === "ONLY_ORIGINAL" || postsConfig.text === "BOTH"
        );
      case "translatedText":
        return (
          postsConfig.text === "ONLY_TRANSLATION" || postsConfig.text === "BOTH"
        );
      default:
        return true;
    }
  });

  const handleTableChange: TableProps<TableRecord>["onChange"] = (
    pagination,
    _filters,
    _sorter
  ) => {
    const pageSize = pagination.pageSize ?? 0;
    const current = pagination.current ?? 1;

    const offset = newPositiveInteger((current - 1) * pageSize);
    const limit = newPositiveInteger(pageSize);
    dispatchSearchRequestStateAction(
      updateSearchRequestAction({ pagination: { offset, limit } })
    );
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
      expandable={{
        expandedRowRender: (record) => (
          <p style={{ margin: 0 }}>{record.fullText}</p>
        ),
        rowExpandable: (record) => record.fullText.length > 0,
      }}
      dataSource={searchResults.items.map((result) => ({
        ...result,
        socialMedia: toSocialMediaLabel(result.socialMedia),
        happenedAt: toLocalTimestamp(result.happenedAt),
        text: clampText(getTextFromSearchResult(result), 100),
        lang: result.data.lang,
        translatedText:
          result.data.lang === "en"
            ? null
            : clampText(result.data.translatedText ?? "n/a", 100),
        fullText: result.data.translatedText ?? getTextFromSearchResult(result),
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
  searchEnabled: boolean;
  isSearching: boolean;
  tableConfigState: TableConfigState;
  dispatchTableConfigStateAction: React.Dispatch<AnyAction>;
};

const TableHeader: React.FC<TableHeaderProps> = ({
  searchObjects,
  onSearch,
  searchRequestState,
  dispatchSearchRequestStateAction,
  searchEnabled,
  isSearching,
  tableConfigState,
  dispatchTableConfigStateAction,
}) => {
  // TODO: allow search for multiple keywords
  const handleSelectKeyword = (vals: string[]) => {
    const keywords = fromEither(
      toSingleEither(vals.map((val) => decode(keywordCodec, val)))
    );

    dispatchSearchRequestStateAction(
      updateSearchRequestAction({
        keywords: isNonEmpty(keywords) ? keywords : undefined,
      })
    );
  };

  const handleSelectFilterSocialMedia = (vals: string[]) => {
    const socialMedias = fromEither(
      toSingleEither(vals.map((val) => decode(socialMediaCodec, val)))
    );

    dispatchSearchRequestStateAction(
      updateSearchRequestAction({
        socialMediaQuery: isNonEmpty(socialMedias) ? socialMedias : undefined,
      })
    );
  };

  const handleRangePickerChanged: RangePickerProps["onChange"] = (
    _dates,
    [startDate, endDate]
  ) => {
    dispatchSearchRequestStateAction(
      updateSearchRequestAction({
        timeQuery: {
          happenedAtStart: startDate ? newDateISOString(startDate) : undefined,
          happenedAtEnd: endDate ? newDateISOString(endDate) : undefined,
        },
      })
    );
  };

  const handleSearchTextChanged = (event: ChangeEvent<HTMLInputElement>) => {
    const val = event.target.value;

    dispatchSearchRequestStateAction(
      updateSearchRequestAction({ dataQuery: val || undefined })
    );
  };

  const handleSearchClicked = () => {
    onSearch();
  };

  const handlePostConfigTextChanged = (
    val: TableConfigState["posts"]["text"]
  ) => {
    dispatchTableConfigStateAction(updateTableConfigPostsText(val));
  };

  const allowedKeywords: Keyword[] = searchObjects
    .filter((searchObject) => searchObject.lockedStatus == "UNLOCKED")
    .map((searchObject) => searchObject.keyword);

  const allowedSocialMedias: SocialMedia[] = socialMedias;

  return (
    <TableHeaderContainer>
      <TableHeaderRow>
        <Select
          placeholder="choose one or more keywords"
          onChange={handleSelectKeyword}
          mode="multiple"
          allowClear
          style={{ minWidth: 400 }}
        >
          {allowedKeywords.map((keyword) => (
            <Option value={keyword} key={keyword}>
              {keyword}
            </Option>
          ))}
        </Select>
        <PrimaryButton
          size="large"
          type="primary"
          icon={<SearchOutlined />}
          onClick={handleSearchClicked}
          disabled={!searchEnabled}
          loading={isSearching}
        >
          Search
        </PrimaryButton>
      </TableHeaderRow>
      <TableHeaderRow>
        <Text>Filters</Text>
      </TableHeaderRow>
      <Input
        placeholder="search for specific text"
        allowClear={true}
        value={searchRequestState.dataQuery}
        onChange={handleSearchTextChanged}
      />
      <Select
        placeholder="all social medias"
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
      <TableHeaderRow>
        <RangePicker
          format="YYYY-MM-DD HH:mm"
          showTime={true}
          allowEmpty={[true, true]}
          onChange={handleRangePickerChanged}
          value={[
            momentOrNull(searchRequestState.timeQuery?.happenedAtStart),
            momentOrNull(searchRequestState.timeQuery?.happenedAtEnd),
          ]}
          style={{ width: "240px" }}
        />
      </TableHeaderRow>
      <TableHeaderRow>
        <Text>Table config</Text>
      </TableHeaderRow>
      <TableHeaderRow>
        <Text>Posts text</Text>
        <Select
          placeholder="text"
          onChange={handlePostConfigTextChanged}
          value={tableConfigState.posts.text}
          style={{ width: "200px" }}
        >
          <Option value="BOTH" key="BOTH">
            Original and Translation
          </Option>
          <Option value="ONLY_ORIGINAL" key="ONLY_ORIGINAL">
            Original only
          </Option>
          <Option value="ONLY_TRANSLATION" key="ONLY_TRANSLATION">
            Translation only
          </Option>
        </Select>
      </TableHeaderRow>
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
