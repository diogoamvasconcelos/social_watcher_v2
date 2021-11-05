import React from "react";
import { useHistory } from "react-router-dom";
import styled from "styled-components";
import { SIGNUP_PATH } from "@src/shared/data/paths";
import HeroImg from "../../../../assets/hero-img.svg";
import Text from "antd/lib/typography/Text";
import { SectionContainer, SectionContentContainer } from "./shared";
import { colors } from "@src/shared/style/colors";
import { fontSize } from "@src/shared/style/fonts";
import { ElevatedPrimaryButton } from "@src/shared/style/components/button";
import { size } from "@src/shared/style/sizing";

const BannerContainer = styled(SectionContainer)`
  position: relative;

  // add small margin to navbar to give a better effect to the selection undeline on the navbar items
  margin-top: 2px;
`;

const Background = styled.div`
  // background bleeds out down into the next section
  position: absolute;
  left: 0%;
  right: 0%;
  top: 0%;
  bottom: -35%;

  background: linear-gradient(93.8deg, #102a43 0%, #829ab1 102.19%);
`;

const BannerContentContainer = styled(SectionContentContainer)`
  padding-top: ${size.size64px};
`;

const BannerDetailsContainer = styled.div`
  max-width: 520px;
  padding-top: ${size.size32px};
  display: flex;
  flex-direction: column;
  gap: ${size.size32px};
  align-items: center;

  // the text
  & span {
    color: ${colors.neutral.light2};
    text-align: center;
  }

  & .highlight-text {
    color: ${colors.primary.light1b};
  }
`;

export const BannerSection: React.FC = () => {
  const history = useHistory();

  const handleFreeTrialClicked = () => {
    history.push(SIGNUP_PATH);
  };

  return (
    <BannerContainer>
      <BannerContentContainer>
        <HeroImg style={{ fontSize: "400px" }} />
        <BannerDetailsContainer>
          <Text style={{ fontSize: fontSize.size20px }}>
            {"Regularly searching for the same keywords in social media?"}
          </Text>
          <Text style={{ fontSize: fontSize.size30px }}>
            Get <span className="highlight-text">notifications</span> when a{" "}
            <span className="highlight-text">keyword</span> is mentioned on{" "}
            <span className="highlight-text">social media</span>
          </Text>
          <ElevatedPrimaryButton
            type="primary"
            onClick={handleFreeTrialClicked}
          >
            Start free trial
          </ElevatedPrimaryButton>
        </BannerDetailsContainer>
      </BannerContentContainer>
      <Background />
    </BannerContainer>
  );
};
