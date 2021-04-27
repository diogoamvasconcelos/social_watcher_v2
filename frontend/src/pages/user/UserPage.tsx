import React, { useEffect, useState } from "react";
import {
  getUserDetails,
  getUserSearchObjects,
} from "../../shared/reducers/userState";
import { useAppDispatch, useAppSelector } from "../../shared/store";
import { JSONViewer } from "../../shared/components/JSONViewer";
import { Typography, Button, Input, Select } from "antd";
import { SearchObject } from "../../../../backend/src/domain/models/userItem";
import styled from "styled-components";
import { searchKeyword } from "./searchState";
import { newLowerCase } from "../../../../backend/src/lib/iots";

const { Title, Text } = Typography;
const { Option } = Select;

const SearchObjectItemContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: white;
  width: 300px;
  text-align: center;
`;
type SearchObjectItemProps = {
  searchObject: SearchObject;
};
const SearchObjectItem: React.FC<SearchObjectItemProps> = ({
  searchObject,
}) => {
  return (
    <SearchObjectItemContainer>
      <Text strong={true}>{searchObject.keyword}</Text>
      <Text>{searchObject.lockedStatus}</Text>
      {searchObject.searchData.twitter.enabledStatus == "ENABLED" ? (
        <Text>twitter</Text>
      ) : null}
    </SearchObjectItemContainer>
  );
};

const SearchWidgetContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: white;
`;
const SearchWidgetHeader = styled.div`
  flex-direction: row;
`;
type searchWidgetProps = {
  searchObjects: SearchObject[];
};
const SearchWidget: React.FC<searchWidgetProps> = ({ searchObjects }) => {
  const dispatch = useAppDispatch();
  const searchResult = useAppSelector((state) => state.search);

  const initialKeyword = "chose a keyword";
  const [keyword, setKeyword] = useState(initialKeyword);

  const handleSearchClicked = () => {
    if (keyword == initialKeyword) {
      return;
    }

    void dispatch(
      searchKeyword({
        keyword: newLowerCase(keyword),
      })
    );
  };

  return (
    <SearchWidgetContainer>
      <SearchWidgetHeader>
        <Select
          defaultValue="chose a keyword"
          onChange={setKeyword}
          style={{ minWidth: 200 }}
        >
          {searchObjects
            .filter((so) => so.lockedStatus == "UNLOCKED")
            .map((so) => (
              <Option value={so.keyword} key={so.index}>
                {so.keyword}
              </Option>
            ))}
        </Select>
        <Input placeholder="search for text" style={{ width: 400 }}></Input>
        <Button onClick={handleSearchClicked}>Search</Button>
      </SearchWidgetHeader>
      <JSONViewer name="results" json={searchResult} />
    </SearchWidgetContainer>
  );
};

export const UserPage: React.FC = () => {
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
      <div>
        <Title level={4}>Keywords</Title>
        {searchObjects.map((searchObject) =>
          SearchObjectItem({ searchObject })
        )}
      </div>
      <div>
        <Title level={4}>Search</Title>
        <SearchWidget searchObjects={searchObjects} />
      </div>
    </div>
  );
};
