import React from "react";
import { useHistory } from "react-router-dom";
import styled from "styled-components";
import { SIGNUP_PATH } from "@src/shared/data/paths";
import heroImg from "../../../../assets/hero-img.svg";
import Text from "antd/lib/typography/Text";
import { SectionContainer, SectionContentContainer } from "./shared";
import { colors } from "@src/shared/style/colors";
import { fontSize } from "@src/shared/style/fonts";
import { ElevatedPrimaryButton } from "@src/shared/style/components/button";
import { size } from "@src/shared/style/sizing";

const BannerContainer = styled(SectionContainer)`
  position: relative;
`;

const Background = styled.div`
  // background bleeds out down into the next section
  position: absolute;
  left: 0%;
  right: 0%;
  top: 0%;
  bottom: -40%;

  background: linear-gradient(93.8deg, #102a43 0%, #829ab1 102.19%);
`;

const BannerContentContainer = styled(SectionContentContainer)`
  padding-top: ${size.size64px};
  /* padding-bottom: ${size.size32px}; */
  gap: ${size.size64px};
`;

const BannerDetailsContainer = styled.div`
  max-width: 520px;
  padding-top: ${size.size32px};
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;

  // the text
  & span {
    color: ${colors.neutral.light2};
    text-align: center;
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
        <img src={heroImg} alt="hero image" style={{ maxWidth: "400px" }} />
        <BannerDetailsContainer>
          <Text style={{ fontSize: fontSize.size20px }}>
            {
              "Are you regularly searching for the same keywords in social media?"
            }
          </Text>
          <Text style={{ fontSize: fontSize.size30px }}>
            Get <strong>notifications</strong> when a <strong>keyword</strong>{" "}
            is mentioned on <strong>social media</strong>
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
