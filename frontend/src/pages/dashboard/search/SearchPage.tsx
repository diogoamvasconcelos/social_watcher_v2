import React, { useEffect, useReducer } from "react";
import styled from "styled-components";
import { getUserSearchObjects } from "@src/shared/reducers/userState";
import { useAppDispatch, useAppSelector } from "@src/shared/store";
import { SearchResultsTable } from "./SearchResultsTable";
import qs from "query-string";
import { RouteComponentProps, useHistory } from "react-router-dom";
import { SearchRequestData } from "./searchState";
import {
  decode,
  newLowerCase,
  newPositiveInteger,
} from "@diogovasconcelos/lib/iots";
import { createAction, createReducer } from "@reduxjs/toolkit";
import { deepmergeSafe } from "@diogovasconcelos/lib";
import { PartialDeep } from "type-fest";
import { keywordCodec } from "@backend/domain/models/keyword";
import { isRight } from "fp-ts/lib/Either";

// +++++++++
// + STATE +
// +++++++++

export type SearchRequestState = SearchRequestData;
const searchRequestInitialState: SearchRequestState = {
  keyword: newLowerCase(""),
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
      console.log("updateSearchRequestAction");
      console.log(action.payload);
      return deepmergeSafe(state, action.payload);
    });
  }
);

// ++++++++++++++++
// + Query String +
// ++++++++++++++++

const getParamsFromQueryString = (queryString: string) => {
  const s = qs.parse(queryString);

  const keywordEither = decode(keywordCodec, s.keyword);
  console.log(keywordEither);
  return {
    keyword: isRight(keywordEither) ? keywordEither.right : undefined,
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

    dispatchSearchRequestStateAction(
      updateSearchRequestAction(getParamsFromQueryString(search))
    );
  }, []);

  useEffect(() => {
    // Update QueryString
    console.log("updateQueryString");
    console.log(searchRequestState);

    const newSearch = qs.parse(search, { parseNumbers: true });
    history.replace({
      search: qs.stringify({
        ...newSearch,
        keyword: searchRequestState.keyword || undefined,
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
