import React, { useEffect } from "react";
import { getUserSearchObjects } from "../../../shared/reducers/userState";
import { useAppDispatch, useAppSelector } from "../../../shared/store";
import { SearchResultsTable } from "./SearchResultsTable";

// TODO: change url on search parameters changed and search on load by default if valid

export const SearchPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const searchObjects = useAppSelector((state) => state.user.searchObjects);

  useEffect(() => {
    void dispatch(getUserSearchObjects());
  }, []);

  return (
    <>
      <SearchResultsTable searchObjects={searchObjects} />
    </>
  );
};
