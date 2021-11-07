import Text from "antd/lib/typography/Text";
import { size } from "@src/shared/style/sizing";
import styled from "styled-components";
import { colors } from "@src/shared/style/colors";
import { fontSize } from "@src/shared/style/fonts";

export const MainSubPageContainter = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${size.size16px};
  padding: ${size.size32px};
`;

export const MainSubPageTitle = styled(Text)`
  text-align: left;
  font-size: ${fontSize.size20px};
  color: ${colors.neutral.dark3};
`;
