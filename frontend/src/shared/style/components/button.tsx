import Button from "antd/lib/button";
import styled, { css } from "styled-components";
import { radius, size } from "../sizing";

const buttonBase = css`
  border-radius: ${radius.radius20px};
  padding: ${size.size4px} ${size.size24px};
`;

export const PrimaryButton = styled(Button)`
  ${buttonBase}
`;

export const ElevatedPrimaryButton = styled(Button)`
  ${buttonBase}
  box-shadow: 0 2px 5px hsla(0, 0%, 0%, .2);
`;
