import React from "react";
import styled from "styled-components";
import { SectionContainer, SectionContentContainer } from "./shared";
import Text from "antd/lib/typography/Text";

const PricingContainer = styled(SectionContainer)`
  background: rgb(84, 58, 3);
  background: linear-gradient(
    90deg,
    rgba(84, 58, 3, 1) 0%,
    rgba(190, 146, 19, 1) 29%,
    rgba(244, 242, 211, 1) 100%
  );
`;

const PricingContentContainer = styled(SectionContentContainer)``;

const PricingBoxContainer = styled.div`
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

export const PricingSection: React.FC = () => {
  return (
    <PricingContainer>
      <Text>Pricing</Text>
      <PricingContentContainer>
        <PricingBoxContainer>
          <Text>Free Trial</Text>
          <Text>1 keyword</Text>
          <Text>30 days</Text>
          <Text>No credit card</Text>
        </PricingBoxContainer>
        <PricingBoxContainer>
          <Text>Monthly</Text>
          <Text>3$ per keyword</Text>
        </PricingBoxContainer>
      </PricingContentContainer>
    </PricingContainer>
  );
};
