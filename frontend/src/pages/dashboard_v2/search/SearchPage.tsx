import React, { useEffect } from "react";
import styled from "styled-components";
import { getUserSearchObjects } from "../../../shared/reducers/userState";
import { useAppDispatch, useAppSelector } from "../../../shared/store";
import { SearchResultsTable } from "./SearchResultsTable";

// TODO: change url on search parameters changed and search on load by default if valid

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  /* TODO: fix this attempt to center items */
  position: relative;
  left: 50%;
  transform: translate(-60%, 0%);
`;

export const SearchPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const searchObjects = useAppSelector((state) => state.user.searchObjects);

  useEffect(() => {
    void dispatch(getUserSearchObjects());
  }, []);

  return (
    <MainContainer>
      <SearchResultsTable searchObjects={searchObjects} />
    </MainContainer>
  );
};
