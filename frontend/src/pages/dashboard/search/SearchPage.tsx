import * as t from "io-ts";
import React, { useEffect, useReducer } from "react";
import styled from "styled-components";
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
import { deepmergeSafe } from "@diogovasconcelos/lib";
import { PartialDeep, SetOptional } from "type-fest";
import { keywordCodec } from "@backend/domain/models/keyword";

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
      return deepmergeSafe(state, action.payload);
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
  // const socialMediaEither = decode(keywordCodec, s.keyword); // TODO: improve this when implemented
  const timeStartEither = decode(dateISOString, s.timeStart);
  const timeEndEither = decode(dateISOString, s.timeEnd);

  return {
    keyword: toRightOrUndefined(keywordEither),
    timeQuery: {
      happenedAtStart: toRightOrUndefined(timeStartEither),
      happenedAtEnd: toRightOrUndefined(timeEndEither),
    },
    dataQuery: toRightOrUndefined(textEither),
    // socialMedia: toRightOrUndefined(socialMediaEither),
  };
};

// +++++++++++++
// + CONTAINER +
// +++++++++++++

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export const SearchPage: React.FC<RouteComponentProps> = ({
  location: { search },
}) => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const searchObjects = useAppSelector((state) => state.user.searchObjects);
  const [searchRequestState, dispatchSearchRequestStateAction] = useReducer(
    searchRequestStateReducer,
    searchRequestInitialState
  );

  useEffect(() => {
    void dispatch(getUserSearchObjects());

    console.log(`search: ${search}`);

    dispatchSearchRequestStateAction(
      updateSearchRequestAction(getParamsFromQueryString(search))
    );
  }, []);

  useEffect(() => {
    // Update QueryString
    const newSearch = qs.parse(search, { parseNumbers: true });
    history.replace({
      search: qs.stringify({
        ...newSearch,
        keyword: searchRequestState.keyword,
        text: searchRequestState.dataQuery,
        timeStart: searchRequestState.timeQuery?.happenedAtStart,
        timeEnd: searchRequestState.timeQuery?.happenedAtEnd,
      }),
    });
  }, [searchRequestState]);

  return (
    <MainContainer>
      <SearchResultsTable
        searchObjects={searchObjects}
        searchRequestState={searchRequestState}
        dispatchSearchRequestStateAction={dispatchSearchRequestStateAction}
      />
    </MainContainer>
  );
};
