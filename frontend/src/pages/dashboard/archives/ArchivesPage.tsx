import * as t from "io-ts";
import React, { useEffect, useReducer } from "react";
import { getUserSearchObjects } from "@src/shared/reducers/userState";
import { useAppDispatch, useAppSelector } from "@src/shared/store";
import { SearchResultsTable } from "./SearchResultsTable";
import qs from "query-string";
import { RouteComponentProps, useHistory } from "react-router-dom";
import { SearchRequestData } from "./searchState";
import {
  dateISOString,
  decode,
  newPositiveInteger,
  toRightOrUndefined,
} from "@diogovasconcelos/lib/iots";
import { createAction, createReducer } from "@reduxjs/toolkit";
import { PartialDeep, SetOptional } from "type-fest";
import { keywordCodec } from "@backend/domain/models/keyword";
import Title from "antd/lib/typography/Title";
import { socialMediaCodec } from "@backend/domain/models/socialMedia";
import { nonEmptyArray } from "io-ts-types/lib/nonEmptyArray";
import { deepmergeSafe } from "@diogovasconcelos/lib/deepmerge";
import _pick from "lodash/pick";
import { MainSubPageContainter } from "../shared";

// +++++++++
// + STATE +
// +++++++++

export type SearchRequestState = SetOptional<SearchRequestData, "keyword">;
const searchRequestInitialState: SearchRequestState = {
  pagination: {
    limit: newPositiveInteger(20),
    offset: newPositiveInteger(0),
  },
};

export const updateSearchRequestAction = createAction<
  PartialDeep<SearchRequestState>
>("UPDATE_SEARCH_REQUEST");

const searchRequestStateReducer = createReducer<SearchRequestState>(
  searchRequestInitialState,
  (builder) => {
    builder.addCase(updateSearchRequestAction, (state, action) => {
      return {
        ...deepmergeSafe(state, action.payload),
        ..._pick(action.payload, "socialMediaQuery"), // deepmerge here doesn't work well with arrays as they get concatenated
      } as SearchRequestState;
    });
  }
);

// ++++++++++++++++
// + Query String +
// ++++++++++++++++

const getParamsFromQueryString = (
  queryString: string
): PartialDeep<SearchRequestState> => {
  const s = qs.parse(queryString);

  const keywordEither = decode(keywordCodec, s.keyword);
  const textEither = decode(t.string, s.text);
  const socialMediaEither = decode(
    nonEmptyArray(socialMediaCodec),
    s.socialMedias
  );
  const timeStartEither = decode(dateISOString, s.timeStart);
  const timeEndEither = decode(dateISOString, s.timeEnd);

  return {
    keyword: toRightOrUndefined(keywordEither),
    timeQuery: {
      happenedAtStart: toRightOrUndefined(timeStartEither),
      happenedAtEnd: toRightOrUndefined(timeEndEither),
    },
    dataQuery: toRightOrUndefined(textEither),
    socialMediaQuery: toRightOrUndefined(socialMediaEither),
  };
};

// ++++++++
// + PAGE +
// ++++++++

const Page: React.FC<RouteComponentProps> = ({ location: { search } }) => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const searchObjects = useAppSelector((state) => state.user.searchObjects);
  const [searchRequestState, dispatchSearchRequestStateAction] = useReducer(
    searchRequestStateReducer,
    searchRequestInitialState
  );

  useEffect(() => {
    void dispatch(getUserSearchObjects());

    dispatchSearchRequestStateAction(
      updateSearchRequestAction(getParamsFromQueryString(search))
    );
  }, []);

  useEffect(() => {
    // Update QueryString
    const newSearch = qs.parse(search, {
      parseNumbers: true,
      arrayFormat: "comma",
    });
    history.replace({
      search: qs.stringify({
        ...newSearch,
        keyword: searchRequestState.keyword,
        text: searchRequestState.dataQuery,
        timeStart: searchRequestState.timeQuery?.happenedAtStart,
        timeEnd: searchRequestState.timeQuery?.happenedAtEnd,
        socialMedias: searchRequestState.socialMediaQuery?.join(","),
      }),
    });
  }, [searchRequestState]);

  return (
    <MainSubPageContainter>
      <Title level={4}>Search through the archived posts</Title>
      <SearchResultsTable
        searchObjects={searchObjects}
        searchRequestState={searchRequestState}
        dispatchSearchRequestStateAction={dispatchSearchRequestStateAction}
      />
    </MainSubPageContainter>
  );
};

export const ArchivesPage = Page;
