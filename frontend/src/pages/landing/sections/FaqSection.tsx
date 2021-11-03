import React from "react";
import styled from "styled-components";
import {
  SectionContainer,
  SectionTitle,
  SectionContentContainer,
} from "./shared";
import Text from "antd/lib/typography/Text";
import Collapse from "antd/lib/collapse/Collapse";
import { fontSize } from "@src/shared/style/fonts";
import { colors } from "@src/shared/style/colors";
import { size } from "@src/shared/style/sizing";
const { Panel } = Collapse;
import { supportEmail } from "@src/shared/data/email";
import { ElevatedPrimaryButton } from "@src/shared/style/components/button";

const FAQContainer = styled(SectionContainer)``;

const FAQListContainer = styled(SectionContentContainer)`
  flex-direction: column;
  gap: ${size.size8px};
  max-width: 800px;
`;

const StyledCollapse = styled(Collapse)`
  background-color: ${colors.neutral.light2};
`;

const QuestionText = styled(Text)`
  font-size: ${fontSize.size20px};
  color: ${colors.support.purple.medium};
`;

const AnswerText = styled(Text)`
  font-size: ${fontSize.size14px};
  color: ${colors.neutral.dark3};
  padding-left: "24px";
`;

const MoreQuestionText = styled(Text)`
  font-size: ${fontSize.size20px};
  color: ${colors.neutral.dark2};
`;

type FAQQuestion = {
  question: string;
  answer: string;
};

export const FaqSection: React.FC<{ questions: FAQQuestion[] }> = ({
  questions,
}) => {
  return (
    <FAQContainer>
      <SectionTitle>FAQ - Frequently asked Questions</SectionTitle>
      <FAQListContainer>
        <StyledCollapse bordered={false}>
          {questions.map((question) => (
            <Panel
              header={<QuestionText>{question.question}</QuestionText>}
              key={question.question}
            >
              <AnswerText>{question.answer}</AnswerText>
            </Panel>
          ))}
        </StyledCollapse>
      </FAQListContainer>
      <MoreQuestionText>Have more questions?</MoreQuestionText>
      <a href={`mailto:${supportEmail}`}>
        <ElevatedPrimaryButton type="ghost"> Contact us</ElevatedPrimaryButton>
      </a>
    </FAQContainer>
  );
};
