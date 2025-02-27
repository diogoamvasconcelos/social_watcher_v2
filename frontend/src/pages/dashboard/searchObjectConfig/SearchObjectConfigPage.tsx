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
  getDefaultSearchObject,
  getUserSearchObject,
  resetConfigState,
  updateUserSearchObject,
} from "./searchObjectConfigState";
import { decode } from "@diogovasconcelos/lib/iots";
import {
  SearchObjectDomain,
  searchObjectIndexCodec,
} from "@backend/domain/models/userItem";
import Spin from "antd/lib/spin";
import { isLeft, isRight } from "fp-ts/lib/Either";
import { navigationConfig } from "../DashboardPage";
import _every from "lodash/every";
import _isEqual from "lodash/isEqual";
import { KEYWORDS_NEW_PATH_ARG } from "../../../shared/data/paths";
import Modal, { ModalProps } from "antd/lib/modal/Modal";
import RightOutlined from "@ant-design/icons/lib/icons/RightOutlined";
import LeftOutlined from "@ant-design/icons/lib/icons/LeftOutlined";
import Tooltip from "antd/lib/tooltip";
import { ElevatedPrimaryButton } from "@src/shared/style/components/button";
import { MainSubPageContainter } from "../shared";
import message from "antd/lib/message";
import Divider from "antd/lib/divider";

const { Step } = Steps;

const TopBarContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 16px;
`;

const BottomBarContainer = styled.div`
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
    title: "Social medias",
    description: "where to search",
    configWidget: SocialMediasConfigWidget,
  } as ConfigStepContent,
  {
    title: "Notifications",
    description: "get real-time notifications",
    configWidget: NotificationsConfigWidget,
  } as ConfigStepContent,
  {
    title: "Reports",
    description: "daily or weekly",
    configWidget: ReportsConfigWidget,
  } as ConfigStepContent,
];

export type ConfigWidgetProps = {
  searchObject: SearchObjectDomain;
  stepState: ConfigStepState;
  setStepState: React.Dispatch<React.SetStateAction<ConfigStepState>>;
};

// ++++++++
// + PAGE +
// ++++++++

const Page: React.FC = () => {
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
    } else if (newIndex) {
      void dispatch(getDefaultSearchObject());
    }
  }, []);

  const [currentStep, setCurrentStep] = useState(0);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [confirmModalType, setConfirmModalType] =
    useState<ConfirmModalProps["type"]>("save");

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
    if (searchObjectConfig.writeStatus === "FULFILLED") {
      void message.info(`${confirmModalType} successful`);
      history.push(navigationConfig["keywords"].path);
      // HACK: reset config state so on page revisit it won't still be FULFILLED
      dispatch(resetConfigState());
    } else if (searchObjectConfig.writeStatus === "REJECTED") {
      void message.error(`${confirmModalType} failed`);
      setConfirmModalVisible(false);
    }
  }, [searchObjectConfig.writeStatus]);

  const handleStepsChange: StepsProps["onChange"] = (current) => {
    setCurrentStep(current);
  };

  const handleSaveButton = () => {
    setConfirmModalType(newIndex ? "add_new" : "save");
    setConfirmModalVisible(true);
  };
  const handleDiscardButton = () => {
    history.push(navigationConfig["keywords"].path);
  };
  const handleDeleteButton = () => {
    setConfirmModalType("delete");
    setConfirmModalVisible(true);
  };
  const handleConfirmModalCancel = () => {
    setConfirmModalVisible(false);
  };
  const handleConfirmModalOk = () => {
    if (!searchObjectConfig.searchObject || isLeft(indexEither)) {
      return;
    }

    if (indexEither.right !== KEYWORDS_NEW_PATH_ARG) {
      switch (confirmModalType) {
        case "save": {
          void dispatch(
            updateUserSearchObject([
              indexEither.right,
              searchObjectConfig.searchObject,
            ])
          );
          return;
        }
        case "delete": {
          void dispatch(deleteUserSearchObject([indexEither.right]));
          return;
        }
        default: {
          return;
        }
      }
    } else {
      // is new / add
      void dispatch(createUserSearchObject([searchObjectConfig.searchObject]));
    }
  };

  const isLoading = searchObjectConfig.getStatus === "PENDING";
  const currentStepContent = stepsContent[currentStep];
  const CurrentConfigWidget = currentStepContent.configWidget; // need to be set to a Capitalized var

  // TODO: fix bug when adding a new searchobject and just changing keywords makes it allowed to save even if no socialmedias
  const saveAllowed = _every(
    stepsContent.map((stepContent) => stepContent.state.status !== "error")
  );
  const searchObjectIsDirty = !_isEqual(
    searchObjectConfig.searchObject,
    searchObjectConfig.fetchedSearchObject
  );

  return (
    <MainSubPageContainter>
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
            <Tooltip
              title={
                !saveAllowed
                  ? "Errors need to be fixed"
                  : !searchObjectIsDirty
                  ? "No changes"
                  : undefined
              }
            >
              <ElevatedPrimaryButton
                size="large"
                type="primary"
                onClick={handleSaveButton}
                disabled={!saveAllowed || !searchObjectIsDirty}
              >
                {newIndex ? "Add" : "Apply"}
              </ElevatedPrimaryButton>
            </Tooltip>
            <Tooltip title="Go back">
              <ElevatedPrimaryButton
                size="large"
                type="default"
                onClick={handleDiscardButton}
              >
                Discard
              </ElevatedPrimaryButton>
            </Tooltip>
            <ElevatedPrimaryButton
              size="large"
              type="text"
              danger={true}
              onClick={handleDeleteButton}
              hidden={newIndex || searchObjectIsDirty}
            >
              Delete
            </ElevatedPrimaryButton>
          </TopBarContainer>
          <BottomBarContainer>
            <ElevatedPrimaryButton
              size="large"
              type="default"
              onClick={() => setCurrentStep(currentStep - 1)}
              disabled={currentStep == 0}
              icon={<LeftOutlined />}
            />
            <ElevatedPrimaryButton
              size="large"
              type="primary"
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={currentStep == stepsContent.length - 1}
              icon={<RightOutlined />}
            />
          </BottomBarContainer>
          <Divider />
          {searchObjectConfig.searchObject && !isLoading ? (
            <CurrentConfigWidget
              searchObject={searchObjectConfig.searchObject}
              stepState={currentStepContent.state}
              setStepState={currentStepContent.setState}
            />
          ) : (
            <Spin />
          )}
          <ConfirmModal
            type={confirmModalType}
            visible={confirmModalVisible}
            searchObject={searchObjectConfig.searchObject}
            isApplying={searchObjectConfig.writeStatus === "PENDING"}
            onOk={handleConfirmModalOk}
            onCancel={handleConfirmModalCancel}
          />
        </>
      ) : (
        <InvalidIndexWidget />
      )}
    </MainSubPageContainter>
  );
};

export const SearchObjectConfigPage = Page;

// ++++++++++++++++
// + CONFIRM MODAL +
// ++++++++++++++++
type ConfirmModalProps = {
  searchObject: SearchObjectDomain | null;
  visible: boolean;
  isApplying: boolean;
  onOk: () => void;
  onCancel: () => void;
  type: "save" | "add_new" | "delete";
};
const ConfirmModal: React.FC<ConfirmModalProps> = ({
  searchObject,
  visible,
  isApplying,
  onOk,
  onCancel,
  type,
}) => {
  const getCustomProps = (
    propType: ConfirmModalProps["type"]
  ): Partial<ModalProps> => {
    switch (propType) {
      case "save":
        return {
          title: `Are you sure you want to apply your changes to ${
            searchObject?.keyword ?? "n/a"
          }?`,
          okText: "Apply",
          okType: "primary",
        };
      case "add_new":
        return {
          title: `Are you sure you want to add the keyword: ${
            searchObject?.keyword ?? "n/a"
          }?`,
          okText: "Add",
          okType: "primary",
        };
      case "delete":
        return {
          title: `Are you sure you want to delete the keyword: ${
            searchObject?.keyword ?? "n/a"
          }?`,
          okText: "Delete",
          okType: "danger",
        };
    }
  };

  return (
    <Modal
      {...getCustomProps(type)}
      visible={visible}
      onOk={onOk}
      confirmLoading={isApplying}
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
    <MainSubPageContainter>
      <Text>INVALID</Text>
    </MainSubPageContainter>
  );
};
