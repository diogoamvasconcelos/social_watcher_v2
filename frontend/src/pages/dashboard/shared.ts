import { size } from "@src/shared/style/sizing";
import styled from "styled-components";

export const MainSubPageContainter = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${size.size16px};
  padding: ${size.size8px};
`;
