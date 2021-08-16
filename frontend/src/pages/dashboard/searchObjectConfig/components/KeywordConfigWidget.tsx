import React, { useState } from "react";
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
  const [keywordValue, setKeywordValue] = useState<string>(
    searchObject.keyword
  );

  const handleKeywordChanged = (val: string) => {
    setKeywordValue(val);

    if (val.length > 0) {
      dispatch(updateKeyword(newLowerCase(val)));
      setStepState({ status: "finish", errorMessage: undefined });
    } else {
      setStepState({ status: "error", errorMessage: "keyword not valid" });
    }
  };

  return (
    <MainContainer>
      <RowDiv>
        <Text>current keyword:</Text>
        <Text strong={true} editable={{ onChange: handleKeywordChanged }}>
          {keywordValue}
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
