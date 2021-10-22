import React from "react";
import parse from "html-react-parser";
import styled from "styled-components";

const TextContainer = styled.div`
  max-width: 800px;
  padding: 32px;
`;

type HTMLComponentProps = { rawHtml: string };
export const HTMLComponent: React.FC<HTMLComponentProps> = ({ rawHtml }) => {
  return <TextContainer>{parse(rawHtml)}</TextContainer>;
};
