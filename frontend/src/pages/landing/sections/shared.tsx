import React from "react";
import styled from "styled-components";
import Text from "antd/lib/typography/Text";
import { size } from "@src/shared/style/sizing";
import { fontSize } from "@src/shared/style/fonts";
import { colors } from "@src/shared/style/colors";

export const SectionContainer = styled.div`
  background-color: transparent;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${size.size32px} 0px;
  gap: ${size.size32px};
`;

export const SectionContentContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: ${size.size32px};

  z-index: 1;
`;

export const SectionTitle = styled(Text)`
  text-align: center;
  z-index: 1;
  font-size: ${fontSize.size24px};
  color: ${colors.neutral.dark2};
`;

export const ContentBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${size.size16px};
  padding: ${size.size32px} ${size.size8px};
  align-items: center;
  width: 224px;
`;

export const ContentBoxTitle = styled(Text)`
  font-size: ${fontSize.size20px};
  color: ${colors.support.purple.dark1};
  text-align: center;
`;

export const ContentBoxText = styled(Text)`
  font-size: ${fontSize.size14px};
  color: ${colors.neutral.dark3};
  text-align: center;
`;

export const ContentBoxList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${size.size16px};
  align-items: flex-start;
`;

const ContentIconTextContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${size.size8px};
  align-items: flex-start;
  justify-content: center;

  & .anticon {
    font-size: ${size.size16px};
    color: ${colors.neutral.dark3};
  }
`;

export const ContentIconTextText = styled(ContentBoxText)`
  font-size: ${fontSize.size18px};
  // fix to align correctly icon on multilined text
  line-height: ${fontSize.size18px};

  text-align: start;
`;

export const ContentIconText: React.FC<{
  text: string;
  Icon: React.ReactElement;
}> = ({ text, Icon }) => {
  return (
    <ContentIconTextContainer>
      {Icon}
      <ContentIconTextText>{text}</ContentIconTextText>
    </ContentIconTextContainer>
  );
};
