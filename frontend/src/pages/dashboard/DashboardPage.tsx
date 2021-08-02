import React, { useEffect } from "react";
import {
  getUserDetails,
  getUserSearchObjects,
  UserState,
} from "../../shared/reducers/userState";
import { useAppDispatch, useAppSelector } from "../../shared/store";
import { SearchResultsTable } from "./SearchResultsTable";
import { SearchObjectsView } from "./SearchObjectsView";
import styled from "styled-components";
import { useHistory } from "react-router-dom";
import Button from "antd/lib/button";
import Typography from "antd/lib/typography";

const { Title, Text } = Typography;

const UserWidgetContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

type UserWidgetProps = {
  user: Required<UserState>["details"];
};
const UserWidget: React.FC<UserWidgetProps> = ({ user }) => {
  const history = useHistory();

  const handleSubscriptionClicked = () => {
    history.push("/user/account");
  };

  return (
    <UserWidgetContainer>
      <Text>{user.email}</Text>
      <Button
        type="text"
        style={{ width: "200px" }}
        onClick={handleSubscriptionClicked}
      >
        {`Subscription: ${user.subscription.type} - ${user.subscription.status}`}
      </Button>
    </UserWidgetContainer>
  );
};

export const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.details);
  const searchObjects = useAppSelector((state) => state.user.searchObjects);

  useEffect(() => {
    void dispatch(getUserDetails());
    void dispatch(getUserSearchObjects());
  }, []);

  return user ? (
    <div>
      <div>
        <Title level={4}>User</Title>
        {<UserWidget user={user} />}
      </div>
      <Title level={4}>Keywords</Title>
      <SearchObjectsView
        searchObjects={searchObjects}
        userNofSearchObjects={user.subscription.nofSearchObjects}
      />
      <div>
        <Title level={4}>Search</Title>
        <SearchResultsTable searchObjects={searchObjects} />
      </div>
    </div>
  ) : null;
};
