import React from "react";
import styled from "styled-components";
import { SectionContainer, SectionContentContainer } from "./shared";
import Text from "antd/lib/typography/Text";

const FeaturesContainer = styled(SectionContainer)`
  background: lightcyan;
`;

const FeaturesContentContainer = styled(SectionContentContainer)`
  gap: 100px;
`;

const FeaturesBoxContainer = styled.div`
  border-radius: 8px;
  border-style: solid;
  border-width: 1px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  align-items: center;
  width: 200px;
`;

export const FeaturesSection: React.FC = () => {
  return (
    <FeaturesContainer>
      <Text>Features</Text>
      <FeaturesContentContainer>
        <FeaturesBoxContainer>
          <Text>social medias</Text>
        </FeaturesBoxContainer>
        <FeaturesBoxContainer>
          <Text>notification</Text>
        </FeaturesBoxContainer>
        <FeaturesBoxContainer>
          <Text>reports</Text>
        </FeaturesBoxContainer>
        <FeaturesBoxContainer>
          <Text>archives</Text>
        </FeaturesBoxContainer>
      </FeaturesContentContainer>
    </FeaturesContainer>
  );
};
