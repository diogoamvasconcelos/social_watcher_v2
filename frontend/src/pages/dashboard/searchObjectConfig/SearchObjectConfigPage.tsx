import * as t from "io-ts";
import Steps, { StepsProps } from "antd/lib/steps";
import { Status as StepStatus } from "rc-steps/lib/interface";
import Text from "antd/lib/typography/Text";
import React, { useEffect } from "react";
import { useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import styled from "styled-components";
import { KeywordConfigWidget } from "./components/KeywordConfigWidget";
import { NotificationsConfigWidget } from "./components/NotificationConfigWidget";
import { SocialMediasConfigWidget } from "./components/SocialMediasConfigWidget";
import { ReportsConfigWidget } from "./components/ReportsConfigWidget";
import { useAppDispatch, useAppSelector } from "../../../shared/store";
import {
  createUserSearchObject,
  deleteUserSearchObject,
  getUserSearchObject,
  updateUserSearchObject,
} from "./searchObjectConfigState";
import { decode } from "@diogovasconcelos/lib";
import {
  SearchObjectDomain,
  searchObjectIndexCodec,
} from "@backend/domain/models/userItem";
import Spin from "antd/lib/spin";
import { isRight } from "fp-ts/lib/Either";
import Button from "antd/lib/button";
import { navigationConfig } from "../DashboardPage";
import _every from "lodash/every";
import _isEqual from "lodash/isEqual";
import { KEYWORDS_NEW_PATH_ARG } from "src/shared/data/paths";
import Modal from "antd/lib/modal/Modal";

const { Step } = Steps;

const MainContainer = styled.div`
  padding: 8px;
`;

const TopBarContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 16px;
`;

type ConfigStepState = {
  status: StepStatus;
  errorMessage?: string;
};
const initialConfigStepState: ConfigStepState = {
  status: "finish",
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
    description: "social medias",
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
  const history = useHistory();
  const { index } = useParams<{ index: string }>();
  const indexEither = decode(
    t.union([searchObjectIndexCodec, t.literal(KEYWORDS_NEW_PATH_ARG)]),
    index
  );
  const newIndex =
    isRight(indexEither) && indexEither.right === KEYWORDS_NEW_PATH_ARG;

  const dispatch = useAppDispatch();
  const searchObjectConfig = useAppSelector(
    (state) => state.searchObjectConfig
  );

  useEffect(() => {
    if (isRight(indexEither) && indexEither.right !== KEYWORDS_NEW_PATH_ARG) {
      void dispatch(getUserSearchObject([indexEither.right]));
    }
  }, []);

  const [currentStep, setCurrentStep] = useState(0);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  // TODO: improve this boiler plate (hard one...)
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

  useEffect(() => {
    if (searchObjectConfig.deleteStatus === "FULFILLED") {
      history.push(navigationConfig["keywords"].path);
    } else if (searchObjectConfig.deleteStatus === "REJECTED") {
      setDeleteModalVisible(false);
    }
  }, [searchObjectConfig.deleteStatus]);

  const handleStepsChange: StepsProps["onChange"] = (current) => {
    setCurrentStep(current);
  };

  const handleSaveButton = () => {
    if (searchObjectConfig.searchObject && isRight(indexEither)) {
      if (indexEither.right === KEYWORDS_NEW_PATH_ARG) {
        void dispatch(
          createUserSearchObject([searchObjectConfig.searchObject])
        );
      } else {
        void dispatch(
          updateUserSearchObject([
            indexEither.right,
            searchObjectConfig.searchObject,
          ])
        );
      }
    }
  };
  const handleDiscardButton = () => {
    history.push(navigationConfig["keywords"].path);
  };
  const handleDeleteButton = () => {
    setDeleteModalVisible(true);
  };

  const isLoading = searchObjectConfig.getStatus === "PENDING";
  const isSaving = searchObjectConfig.putStatus === "PENDING";
  const currentStepContent = stepsContent[currentStep];
  const CurrentConfigWidget = currentStepContent.configWidget; // need to be set to a Capitalized var

  const saveAllowed = _every(
    stepsContent.map((stepContent) => stepContent.state.status !== "error")
  );
  const searchObjectIsDirty = !_isEqual(
    searchObjectConfig.searchObject,
    searchObjectConfig.fetchedSearchObject
  );

  return (
    <MainContainer>
      {isRight(indexEither) ? (
        <>
          <TopBarContainer>
            <Steps current={currentStep} onChange={handleStepsChange}>
              {stepsContent.map(({ title, description, state }, i) => {
                const isSelected = currentStep == i;
                return (
                  <Step
                    title={title}
                    description={state.errorMessage ?? description}
                    status={isSelected ? "process" : state.status}
                    key={title}
                  />
                );
              })}
            </Steps>
            <Button
              type="primary"
              onClick={handleSaveButton}
              loading={isSaving}
              disabled={!saveAllowed || !searchObjectIsDirty}
            >
              {newIndex ? "Add" : "Save"}
            </Button>
            <Button type="default" onClick={handleDiscardButton}>
              Discard
            </Button>
            <Button
              type="text"
              danger={true}
              onClick={handleDeleteButton}
              hidden={newIndex}
            >
              Delete
            </Button>
          </TopBarContainer>
          {searchObjectConfig.searchObject && !isLoading ? (
            <CurrentConfigWidget
              searchObject={searchObjectConfig.searchObject}
              stepState={currentStepContent.state}
              setStepState={currentStepContent.setState}
            />
          ) : (
            <Spin />
          )}
          <DeleteModal
            visible={deleteModalVisible}
            searchObject={searchObjectConfig.fetchedSearchObject}
            isDeleting={searchObjectConfig.deleteStatus === "PENDING"}
            onOk={() => {
              if (
                searchObjectConfig.searchObject &&
                isRight(indexEither) &&
                indexEither.right !== KEYWORDS_NEW_PATH_ARG
              ) {
                void dispatch(deleteUserSearchObject([indexEither.right]));
              }
            }}
            onCancel={() => setDeleteModalVisible(false)}
          />
        </>
      ) : (
        <InvalidIndexWidget />
      )}
    </MainContainer>
  );
};

export type ConfigWidgetProps = {
  searchObject: SearchObjectDomain;
  stepState: ConfigStepState;
  setStepState: React.Dispatch<React.SetStateAction<ConfigStepState>>;
};

// ++++++++++++++++
// + DELETE MODAL +
// ++++++++++++++++
type DeleteModalProps = {
  searchObject: SearchObjectDomain | null;
  visible: boolean;
  isDeleting: boolean;
  onOk: () => void;
  onCancel: () => void;
};
const DeleteModal: React.FC<DeleteModalProps> = ({
  searchObject,
  visible,
  isDeleting,
  onOk,
  onCancel,
}) => {
  return (
    <Modal
      title={`Are you sure you want to delete the keyword: ${
        searchObject?.keyword ?? "n/a"
      }?`}
      visible={visible}
      onOk={onOk}
      okText="Delete"
      okType="danger"
      confirmLoading={isDeleting}
      onCancel={onCancel}
    ></Modal>
  );
};

// +++++++++++++++++
// + INVALID INDEX +
// +++++++++++++++++

// TODO: improve this
const InvalidIndexWidget: React.FC = () => {
  return (
    <MainContainer>
      <Text>INVALID</Text>
    </MainContainer>
  );
};
