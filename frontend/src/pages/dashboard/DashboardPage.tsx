import React, { useEffect } from "react";
import {
  getUserDetails,
  getUserSearchObjects,
} from "../../shared/reducers/userState";
import { useAppDispatch, useAppSelector } from "../../shared/store";
import { JSONViewer } from "../../shared/components/JSONViewer";
import { Typography } from "antd";
import { SearchResultsTable } from "./SearchResultsTable";
import { SearchObjectsView } from "./SearchObjectsView";
import { newPositiveInteger } from "../../../../backend/src/lib/iots";

const { Title } = Typography;

export const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.details);
  const searchObjects = useAppSelector((state) => state.user.searchObjects);

  useEffect(() => {
    void dispatch(getUserDetails());
    void dispatch(getUserSearchObjects());
  }, []);

  return (
    <div>
      <div>
        <Title level={4}>User</Title>
        {<JSONViewer name="user" json={user} />}
      </div>
      <Title level={4}>Keywords</Title>
      <SearchObjectsView
        searchObjects={searchObjects}
        userNofSearchObjects={user?.nofSearchObjects ?? newPositiveInteger(0)}
      />
      <div>
        <Title level={4}>Search</Title>
        <SearchResultsTable searchObjects={searchObjects} />
      </div>
    </div>
  );
};
