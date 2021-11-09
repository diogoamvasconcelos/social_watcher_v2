import { size } from "@src/shared/style/sizing";
import styled from "styled-components";

export const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${size.size16px};
  gap: ${size.size8px};
  align-items: center;
`;

export const RowDiv = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${size.size8px};
`;
