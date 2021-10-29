import React from "react";
import { useHistory } from "react-router-dom";
import styled from "styled-components";
import { SIGNUP_PATH } from "@src/shared/data/paths";
import logo from "../../../../assets/logo-og.jpg";
import Text from "antd/lib/typography/Text";
import Button from "antd/lib/button";
import { SectionContainer, SectionContentContainer } from "./shared";

const BannerContainer = styled(SectionContainer)`
  // https://cssgradient.io/
  background: rgb(2, 0, 36);
  background: linear-gradient(
    90deg,
    rgba(2, 0, 36, 1) 0%,
    rgba(9, 121, 113, 1) 22%,
    rgba(184, 238, 233, 1) 100%
  );
`;

const BannerDetailsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  max-width: 520px;
  text-align: center;
`;

export const BannerSection: React.FC = () => {
  const history = useHistory();

  const handleFreeTrialClicked = () => {
    history.push(SIGNUP_PATH);
  };

  return (
    <BannerContainer>
      <SectionContentContainer>
        <img src={logo} alt="Logo" style={{ maxWidth: "400px" }} />
        <BannerDetailsContainer>
          <Text style={{ fontSize: "32px" }}>
            Track <strong>keywords</strong> in the most popular{" "}
            <strong>social media</strong>
          </Text>
          <Text style={{ fontSize: "20px" }}>
            Get real-time <strong>notifications</strong> when new content is
            published
          </Text>
          <Button
            type="primary"
            onClick={handleFreeTrialClicked}
            style={{ width: "200px" }}
          >
            Start free trial
          </Button>
        </BannerDetailsContainer>
      </SectionContentContainer>
    </BannerContainer>
  );
};
