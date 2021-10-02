import React, { useEffect } from "react";
import Spin from "antd/lib/spin";
import Text from "antd/lib/typography/Text";
import {
  getUserDetails,
  getUserSearchObjects,
} from "../../../shared/reducers/userState";
import { useAppDispatch, useAppSelector } from "../../../shared/store";
import { SearchObjectsList } from "./SearchObjectsList";
import styled from "styled-components";
import { useHistory } from "react-router-dom";
import { KEYWORDS_NEW_PATH, USER_PATH } from "../../../shared/data/paths";
import Button from "antd/lib/button";

const LoadingUserWidget: React.FC = () => {
  return (
    <div style={{ display: "flex", gap: "8px" }}>
      <Text>Loading User</Text>
      <Spin />
    </div>
  );
};

// TODO: Improve this with a nice "onboarding" touch
const NoSearchObjectsWidget: React.FC<{
  onNewSearchObjectClicked: () => void;
}> = ({ onNewSearchObjectClicked }) => {
  return (
    <>
      <Text>Create your first item</Text>
      <Button
        type="primary"
        style={{ width: "200px", borderRadius: "4px" }}
        onClick={onNewSearchObjectClicked}
      >
        Add new keyword
      </Button>
    </>
  );
};

// ++++++++
// + PAGE +
// ++++++++

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  /* TODO: fix this attempt to center items */
  position: relative;
  left: 50%;
  transform: translate(-100%, 0%);
  padding: 8px;
`;

const Page: React.FC = () => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.details);
  const searchObjects = useAppSelector((state) => state.user.searchObjects);

  useEffect(() => {
    void dispatch(getUserDetails());
    void dispatch(getUserSearchObjects());
  }, []);

  const handleNewSearchObjectClicked = () => {
    history.push(KEYWORDS_NEW_PATH);
  };
  const handleManageAccountClicked = () => {
    history.push(USER_PATH);
  };

  return (
    <MainContainer>
      {user ? (
        <>
          <Text>{`Keywords (${searchObjects.length}/${user.subscription.nofSearchObjects})`}</Text>
          {searchObjects.length == 0 ? (
            <NoSearchObjectsWidget
              onNewSearchObjectClicked={handleNewSearchObjectClicked}
            />
          ) : (
            <SearchObjectsList
              searchObjects={searchObjects}
              allowNewSearchObject={
                searchObjects.length < user.subscription.nofSearchObjects
              }
              onNewSearchObjectClicked={handleNewSearchObjectClicked}
              onManageAccountClicked={handleManageAccountClicked}
            />
          )}
        </>
      ) : (
        <LoadingUserWidget />
      )}
    </MainContainer>
  );
};

export const KeywordsPage = Page;
