import React from "react";
import styled from "styled-components";
import Text from "antd/lib/typography/Text";
import { ConfigWidgetProps } from "../SearchObjectConfigPage";
import { SearchObjectDomain } from "@backend/domain/models/userItem";
import { useAppDispatch } from "../../../../shared/store";
import { PartialDeep } from "type-fest";
import { deepmergeSafe } from "@diogovasconcelos/lib/deepmerge";
import { updateReportData } from "../searchObjectConfigState";
import Radio, { RadioChangeEvent } from "antd/lib/radio";
import Divider from "antd/lib/divider";
import Input from "antd/lib/input";

// ++++++++++
// + WIDGET +
// ++++++++++

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px;
  gap: 8px;
`;

export const ReportsConfigWidget: React.FC<ConfigWidgetProps> = ({
  searchObject,
}) => {
  return (
    <MainContainer>
      <Text>Reports Config</Text>
      <Text code>
        Get daily or weekly reports with a summary of the results found
      </Text>
      <div>
        <Divider />
        <EmailConfigWidget reportData={searchObject.reportData} />
      </div>
    </MainContainer>
  );
};

// +++++++++
// + EMAIL +
// +++++++++

const ConfigContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  border-style: solid;
  border-width: 1px;
  border-radius: 4px;
  padding: 8px 16px;
  max-width: 500px;
`;

const RowDiv = styled.div`
  display: grid;
  grid-template-columns: 100px 1fr;
`;

type EmailConfigWidgetProps = {
  reportData: SearchObjectDomain["reportData"];
};

// TODO: make a dynamic Add/Remove email addresses
const EmailConfigWidget: React.FC<EmailConfigWidgetProps> = ({
  reportData,
}) => {
  const dispatch = useAppDispatch();

  const dispatchUpdateNotificationData = (
    data: PartialDeep<SearchObjectDomain["reportData"]["email"]>
  ) => {
    dispatch(updateReportData(deepmergeSafe(reportData, { email: data })));
  };

  const handleFrequencyRadioChange = (e: RadioChangeEvent) => {
    dispatchUpdateNotificationData({
      status: e.target
        .value as SearchObjectDomain["reportData"]["email"]["status"],
    });
  };

  const isEnabled = reportData.email.status != "DISABLED";

  return (
    <>
      <Text>Email</Text>
      <ConfigContainer>
        <RowDiv>
          <Text style={{ gridColumnStart: "1" }}>Frequency</Text>
          <Radio.Group
            style={{ gridColumnStart: "2", justifySelf: "end" }}
            onChange={handleFrequencyRadioChange}
            value={reportData.email.status}
          >
            <Radio value={"DISABLED"}>Never/Disabled</Radio>
            <Radio value={"DAILY"}>Daily</Radio>
            <Radio value={"WEEKLY"}>Weekly</Radio>
          </Radio.Group>
        </RowDiv>
        <RowDiv>
          <Text style={{ gridColumnStart: "1" }}>Email addresses</Text>
          <Input
            placeholder="enter a valid email to recieve the reports"
            defaultValue={reportData.email.addresses?.join(", ")}
            disabled={!isEnabled}
          />
        </RowDiv>
      </ConfigContainer>
    </>
  );
};
