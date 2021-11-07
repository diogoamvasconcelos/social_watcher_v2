import React, { useEffect } from "react";
import Spin from "antd/lib/spin";
import Text from "antd/lib/typography/Text";
import {
  getUserDetails,
  getUserSearchObjects,
} from "../../../shared/reducers/userState";
import { useAppDispatch, useAppSelector } from "../../../shared/store";
import { SearchObjectsList } from "./SearchObjectsList";
import { useHistory } from "react-router-dom";
import { KEYWORDS_NEW_PATH, USER_PATH } from "../../../shared/data/paths";
import { MainSubPageContainter, MainSubPageTitle } from "../shared";
import { ElevatedPrimaryButton } from "@src/shared/style/components/button";

const LoadingUserWidget: React.FC = () => {
  return (
    <>
      <MainSubPageTitle>Loading User</MainSubPageTitle>
      <Spin />
    </>
  );
};

// TODO: Improve this with a nice "onboarding" touch
const NoSearchObjectsWidget: React.FC<{
  onNewSearchObjectClicked: () => void;
}> = ({ onNewSearchObjectClicked }) => {
  return (
    <>
      <Text>Configure the first keyword you want to watch</Text>
      <ElevatedPrimaryButton
        size="large"
        type="primary"
        style={{ width: "200px", borderRadius: "4px" }}
        onClick={onNewSearchObjectClicked}
      >
        Add new keyword
      </ElevatedPrimaryButton>
    </>
  );
};

// ++++++++
// + PAGE +
// ++++++++

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
    <MainSubPageContainter>
      {user ? (
        <>
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
    </MainSubPageContainter>
  );
};

export const KeywordsPage = Page;
