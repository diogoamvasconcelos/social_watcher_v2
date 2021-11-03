import { Footer as AntdFooter } from "antd/lib/layout/layout";
import Text from "antd/lib/typography/Text";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { supportEmail } from "../data/email";
import { PRIVACY_POLICY_PATH, TERMS_AND_CONDITIONS_PATH } from "../data/paths";
import { colors } from "../style/colors";
import { fontSize } from "../style/fonts";
import { size } from "../style/sizing";

const MainContainer = styled(AntdFooter)`
  background-color: ${colors.neutral.dark2};
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: ${size.size16px} ${size.size40px} ${size.size32px} ${size.size40px};
`;

const InformationContainter = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0px;
  gap: ${size.size8px};
`;

const NavigationContainter = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${size.size8px};
`;

const FooterText = styled(Text)`
  color: ${colors.neutral.light2};
  font-size: ${fontSize.size14px};
`;

export const Footer: React.FC = () => {
  const [year, setYear] = useState(2021);
  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <MainContainer>
      <InformationContainter>
        <FooterText>{`© ${year} the Social Watcher, Diogo Vasconcelos AB`}</FooterText>
        <FooterText>{supportEmail}</FooterText>
      </InformationContainter>
      <NavigationContainter>
        <a href={TERMS_AND_CONDITIONS_PATH}>Terms and Conditions</a>
        <FooterText>|</FooterText>
        <a href={PRIVACY_POLICY_PATH}>Privacy Policy</a>
      </NavigationContainter>
    </MainContainer>
  );
};
