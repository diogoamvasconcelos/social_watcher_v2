import { Footer as AntdFooter } from "antd/lib/layout/layout";
import Text from "antd/lib/typography/Text";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { PRIVACY_POLICY_PATH, TERMS_AND_CONDITIONS_PATH } from "../data/paths";

const MainContainer = styled(AntdFooter)`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 16px 50p 32px 50px;
`;

const InformationContainter = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0px;
  gap: 8px;
`;

const NavigationContainter = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
`;

export const Footer: React.FC = () => {
  const [year, setYear] = useState(2021);
  const supportEmail = "support@thesocialwatcher.com";

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <MainContainer>
      <InformationContainter>
        <Text>{`© ${year} the Social Watcher, Diogo Vasconcelos AB`}</Text>
        <a href={`mailto: ${supportEmail}`}>{supportEmail}</a>
      </InformationContainter>
      <NavigationContainter>
        <a href={TERMS_AND_CONDITIONS_PATH}>Terms and Conditions</a>
        <Text>|</Text>
        <a href={PRIVACY_POLICY_PATH}>Privacy Policy</a>
      </NavigationContainter>
    </MainContainer>
  );
};
