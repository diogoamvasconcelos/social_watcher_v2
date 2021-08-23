import React, { useEffect } from "react";
import { ConfigWidgetProps } from "../SearchObjectConfigPage";
import Text from "antd/lib/typography/Text";
import { useAppDispatch } from "../../../../shared/store";
import { updateKeyword } from "../searchObjectConfigState";
import { newLowerCase } from "@diogovasconcelos/lib";
import styled from "styled-components";

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px;
  gap: 2px;
`;

const RowDiv = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
`;

export const KeywordConfigWidget: React.FC<ConfigWidgetProps> = ({
  searchObject,
  setStepState,
}) => {
  const dispatch = useAppDispatch();

  const handleKeywordChanged = (val: string) => {
    dispatch(updateKeyword(newLowerCase(val)));
  };

  useEffect(() => {
    if (searchObject.keyword.length > 0) {
      setStepState({ status: "finish", errorMessage: undefined });
    } else {
      setStepState({ status: "error", errorMessage: "keyword not valid" });
    }
  }, [searchObject.keyword]);

  return (
    <MainContainer>
      <RowDiv>
        <Text>Current keyword:</Text>
        <Text strong={true} editable={{ onChange: handleKeywordChanged }}>
          {searchObject.keyword}
        </Text>
      </RowDiv>
      <RowDiv>
        <Text code>
          Try to use a simple word instead of a combination of words.{" "}
        </Text>
      </RowDiv>
    </MainContainer>
  );
};
