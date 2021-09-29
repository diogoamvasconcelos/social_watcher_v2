import React, { useEffect } from "react";
import { ConfigWidgetProps } from "../SearchObjectConfigPage";
import Text from "antd/lib/typography/Text";
import { useAppDispatch } from "../../../../shared/store";
import { updateKeyword } from "../searchObjectConfigState";
import { newLowerCase } from "@diogovasconcelos/lib";
import {
  validateKeyword,
  ValidateKeywordErrors,
} from "@backend/domain/controllers/validateKeyword";
import styled from "styled-components";
import { isLeft } from "fp-ts/lib/Either";

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
    const validateKeywordEither = validateKeyword(searchObject.keyword);

    if (isLeft(validateKeywordEither)) {
      const getErrorMessage = (error: ValidateKeywordErrors) => {
        switch (error) {
          case "TOO_MANY_WORDS":
            return "Can't have more than 3 words";
          case "TOO_LONG":
            return "Can't be more than 40 characters long";
          case "STARTS_WITH_SPACE":
            return "Can't start with a 'space'";
          case "ENDS_WITH_SPACE":
            return "Can't end with a 'space'";
        }
      };
      setStepState({
        status: "error",
        errorMessage: getErrorMessage(validateKeywordEither.left),
      });
    } else {
      setStepState({ status: "finish", errorMessage: undefined });
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
