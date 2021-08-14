import Steps, { StepsProps } from "antd/lib/steps";
import { Status as StepStatus } from "rc-steps/lib/interface";
import Text from "antd/lib/typography/Text";
import React, { useEffect } from "react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { KeywordConfigWidget } from "./components/KeywordConfigWidget";
import { NotificationsConfigWidget } from "./components/NotificationConfigWidget";
import { SocialMediasConfigWidget } from "./components/SocialMediasConfigWidget";
import { ReportsConfigWidget } from "./components/ReportsConfigWidget";
import { useAppDispatch, useAppSelector } from "../../../shared/store";

const { Step } = Steps;

const MainContainer = styled.div``;

type ParamType = {
  index: string;
};

type ConfigStepState = {
  status: StepStatus;
  errorMessage?: string;
};
const initialConfigStepState: ConfigStepState = {
  status: "wait",
};

type ConfigStepContent = {
  title: string;
  description?: string;
  configWidget: React.FC<ConfigWidgetProps>;
  state: ConfigWidgetProps["stepState"];
  setState: ConfigWidgetProps["setStepState"];
};

const stepsContent: ConfigStepContent[] = [
  {
    title: "Keyword",
    configWidget: KeywordConfigWidget,
  } as ConfigStepContent,
  {
    title: "Search",
    description: "Enabled social medias",
    configWidget: SocialMediasConfigWidget,
  } as ConfigStepContent,
  {
    title: "Notifications",
    configWidget: NotificationsConfigWidget,
  } as ConfigStepContent,
  {
    title: "Reports",
    configWidget: ReportsConfigWidget,
  } as ConfigStepContent,
];

export const SearchObjectConfigPage: React.FC = () => {
  const { index } = useParams<ParamType>();

  const dispatch = useAppDispatch();
  const searchObjects = useAppSelector((state) => state.user.searchObjects);

  useEffect(() => {
    void dispatch(getUserSearchObjects());
  }, []);

  const [currentStep, setCurrentStep] = useState(0);

  // TODO: improve this boiler plate
  // hooks need to be called always on the same order, can't use hooks or map to initiate them
  const [keywordStepState, setKeywordStepState] = useState<ConfigStepState>(
    initialConfigStepState
  );
  stepsContent[0].state = keywordStepState;
  stepsContent[0].setState = setKeywordStepState;

  const [socialMediasStepState, setSocialMediasStepState] =
    useState<ConfigStepState>(initialConfigStepState);
  stepsContent[1].state = socialMediasStepState;
  stepsContent[1].setState = setSocialMediasStepState;

  const [notificationsStepState, setNotificationsStepState] =
    useState<ConfigStepState>(initialConfigStepState);
  stepsContent[2].state = notificationsStepState;
  stepsContent[2].setState = setNotificationsStepState;

  const [reportsStepState, setReportsStepState] = useState<ConfigStepState>(
    initialConfigStepState
  );
  stepsContent[3].state = reportsStepState;
  stepsContent[3].setState = setReportsStepState;

  const handleStepsChange: StepsProps["onChange"] = (current) => {
    setCurrentStep(current);
  };

  const makeStep = (
    { title, description, state }: ConfigStepContent,
    isSelected: boolean
  ) => {
    return (
      <Step
        title={title}
        description={state.errorMessage ?? description}
        status={isSelected ? "process" : state.status}
        key={title}
      />
    );
  };

  const currentStepContent = stepsContent[currentStep];
  const CurrentConfigWidget = currentStepContent.configWidget; // need to be set to a Capitalized var

  return (
    <MainContainer>
      <Text>{`Config for index: ${index}`}</Text>
      <Steps current={currentStep} onChange={handleStepsChange}>
        {stepsContent.map((content, i) => makeStep(content, currentStep == i))}
      </Steps>
      <CurrentConfigWidget
        stepState={currentStepContent.state}
        setStepState={currentStepContent.setState}
      />
    </MainContainer>
  );
};

export type ConfigWidgetProps = {
  stepState: ConfigStepState;
  setStepState: React.Dispatch<React.SetStateAction<ConfigStepState>>;
};
