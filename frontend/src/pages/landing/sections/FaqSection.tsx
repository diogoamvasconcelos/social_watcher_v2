import React from "react";
import styled from "styled-components";
import { SectionContainer } from "./shared";
import Text from "antd/lib/typography/Text";
import Button from "antd/lib/button";
import Collapse from "antd/lib/collapse/Collapse";
const { Panel } = Collapse;

const FAQContainer = styled(SectionContainer)`
  background: aliceblue;
`;

const FAQListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

type FAQQuestion = {
  question: string;
  answer: string;
};

export const FaqSection: React.FC<{ questions: FAQQuestion[] }> = ({
  questions,
}) => {
  const handleContactUsButtonClicked = () => {
    console.log("handleContactUsButtonClicked");
  };
  return (
    <FAQContainer>
      <Text>FAQ - Frequenlty asked Questions</Text>
      <FAQListContainer>
        <Collapse ghost style={{ textAlign: "center" }}>
          {questions.map((question) => (
            <Panel header={question.question} key={question.question}>
              <Text>{question.answer}</Text>
            </Panel>
          ))}
        </Collapse>
      </FAQListContainer>
      <Text>Have more questions?</Text>
      <Button onClick={handleContactUsButtonClicked}> Contact us</Button>
    </FAQContainer>
  );
};
