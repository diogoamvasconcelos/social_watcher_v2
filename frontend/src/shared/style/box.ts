import { css } from "styled-components";
import { radius } from "./sizing";

export const boxDropShadow = css`
  box-shadow: 0px 4px 4px hsla(0, 0%, 0%, 0.2);
`;

export const boxRoundBorder = css`
  border-radius: ${radius.size16px};
`;

export const boxLessRoundBorder = css`
  border-radius: ${radius.size8px};
`;
