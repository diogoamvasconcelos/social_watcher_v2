import React from "react";
import styled from "styled-components";
import {
  SectionContainer,
  SectionContentContainer,
  SectionTitle,
  ContentBox,
  ContentBoxTitle,
  ContentBoxList,
  ContentIconText,
} from "./shared";
import Text from "antd/lib/typography/Text";
import { colors } from "@src/shared/style/colors";
// import { size } from "@src/shared/style/sizing";
import { boxDropShadow, boxRoundBorder } from "@src/shared/style/box";
import { fontSize } from "@src/shared/style/fonts";
import { ElevatedPrimaryButton } from "@src/shared/style/components/button";
import CheckCircleOutlined from "@ant-design/icons/lib/icons/CheckCircleOutlined";
import { size } from "@src/shared/style/sizing";
import { useHistory } from "react-router-dom";
import { SIGNUP_PATH } from "@src/shared/data/paths";

const PricingContainer = styled(SectionContainer)`
  background: ${colors.neutral.light1};
`;

const PricingContentContainer = styled(SectionContentContainer)``;

const PricingBoxContainer = styled(ContentBox)`
  ${boxDropShadow}
  ${boxRoundBorder}
  background: linear-gradient(0deg, ${colors.neutral.dark2} 57%, ${colors
    .neutral.light3} 43%);
  padding: ${size.size16px} ${size.size8px} ${size.size32px} ${size.size8px};
  width: 260px;
`;

const PriceText = styled(Text)`
  font-size: ${fontSize.size20px};
  color: ${colors.neutral.dark3};
  text-align: center;
  padding: 0 0 ${size.size16px} 0;

  & .big-price-text {
    font-size: ${fontSize.size48px};
  }
`;

const PriceBoxList = styled(ContentBoxList)`
  padding: ${size.size8px} 0px ${size.size8px} 0px;

  color: ${colors.neutral.light2};

  & .anticon {
    color: ${colors.neutral.light2};
  }
`;

export const PricingSection: React.FC = () => {
  const history = useHistory();

  const handleFreeTrialClicked = () => {
    history.push(SIGNUP_PATH);
  };

  return (
    <PricingContainer>
      <SectionTitle>Pricing</SectionTitle>
      <PricingContentContainer>
        <PricingBoxContainer>
          <ContentBoxTitle>Free Trial</ContentBoxTitle>
          <PriceText>
            <span className="big-price-text">30</span> days
          </PriceText>
          <PriceBoxList>
            <ContentIconText
              text={"only 1 keyword"}
              Icon={<CheckCircleOutlined />}
            />
            <ContentIconText
              text={"all features available"}
              Icon={<CheckCircleOutlined />}
            />
            <ContentIconText
              text={"no credit card"}
              Icon={<CheckCircleOutlined />}
            />
          </PriceBoxList>
        </PricingBoxContainer>
        <PricingBoxContainer>
          <ContentBoxTitle>Monthly</ContentBoxTitle>
          <PriceText>
            $<span className="big-price-text">3</span> per keyword
          </PriceText>
          <PriceBoxList>
            <ContentIconText
              text={"pay per keyword"}
              Icon={<CheckCircleOutlined />}
            />
            <ContentIconText
              text={"all features available"}
              Icon={<CheckCircleOutlined />}
            />
          </PriceBoxList>
          <ElevatedPrimaryButton
            size="large"
            type="primary"
            onClick={handleFreeTrialClicked}
          >
            Try 30 days free
          </ElevatedPrimaryButton>
        </PricingBoxContainer>
      </PricingContentContainer>
    </PricingContainer>
  );
};
