import { SocialMedia, socialMedias } from "@backend/domain/models/socialMedia";
import { searchKeyword, SearchState } from "./searchState";
import Table, { ColumnsType, TablePaginationConfig } from "antd/lib/table";
import styled from "styled-components";
import { SearchObjectDomain } from "@backend/domain/models/userItem";
import { useAppDispatch, useAppSelector } from "../../../shared/store";
import React, { ChangeEvent, useState } from "react";
import {
  DateISOString,
  newDateISOString,
  newLowerCase,
} from "@diogovasconcelos/lib";
import { toLocalTimestamp } from "../../../shared/lib/formatting";
import { SearchResult } from "@backend/domain/models/searchResult";
import Select from "antd/lib/select";
import { Keyword } from "@backend/domain/models/keyword";
import DatePicker, { RangePickerProps } from "antd/lib/date-picker";
import { useEffect } from "react";
import Button from "antd/lib/button";
import SearchOutlined from "@ant-design/icons/lib/icons/SearchOutlined";
import Typography from "antd/lib/typography";
import Input from "antd/lib/input";
import { SearchRequestUserData } from "@backend/handlers/api/models/search";

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Text } = Typography;

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
};

const TableHeader: React.FC<TableHeaderProps> = ({
  searchObjects,
  onSearch,
}) => {
  const dispatch = useAppDispatch();
  const initialKeyword = "chose a keyword";
  const [searchRequestData, setSearchRequestData] =
    useState<SearchRequestUserData>({ keyword: newLowerCase(initialKeyword) });

  const [searchEnabled, setSearchEnabled] = useState(false);

  // TODO: allow search for multiple keywords
  const handleSelectKeyword = (val: string) => {
    setSearchRequestData({ ...searchRequestData, keyword: newLowerCase(val) });
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
    const startTime: DateISOString | undefined = startDate
      ? newDateISOString(startDate)
      : undefined;
    const endTime: DateISOString | undefined = endDate
      ? newDateISOString(endDate)
      : undefined;

    setSearchRequestData({
      ...searchRequestData,
      timeQuery: {
        happenedAtStart: startTime,
        happenedAtEnd: endTime,
      },
    });
  };

  const handleSearchTextChanged = (event: ChangeEvent<HTMLInputElement>) => {
    const val = event.target.value;

    setSearchRequestData({
      ...searchRequestData,
      dataQuery: val || undefined,
    });
  };

  const handleSearchClicked = () => {
    if (!searchEnabled) {
      return;
    }

    void dispatch(searchKeyword([searchRequestData]));
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
