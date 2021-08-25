import React, { useState } from "react";
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
import Button from "antd/lib/button";
import DeleteOutlined from "@ant-design/icons/lib/icons/DeleteOutlined";
import InfoCircleOutlined from "@ant-design/icons/lib/icons/InfoCircleOutlined";
import Tooltip from "antd/lib/tooltip";
import {
  decode,
  emailFromString,
  newEmailFromString,
} from "@diogovasconcelos/lib/iots";
import { isLeft } from "fp-ts/lib/Either";

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
  max-width: 600px;
`;

const RowDiv = styled.div`
  display: grid;
  grid-template-columns: 200px 1fr;
`;

const LabelDiv = styled.div`
  grid-column-start: 1;
  display: flex;
  gap: 4px;
  align-items: center;
`;

type EmailConfigWidgetProps = {
  reportData: SearchObjectDomain["reportData"];
};

const EmailConfigWidget: React.FC<EmailConfigWidgetProps> = ({
  reportData,
}) => {
  const dispatch = useAppDispatch();
  const [addEmailInputValue, setAddEmailInputValue] = useState("");

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

  const handleAddressAdd = (addAddress: string) => {
    const validateAddressEither = decode(emailFromString, addAddress);
    if (isLeft(validateAddressEither)) {
      // TODO: show error?
      return;
    }
    const validAddress = validateAddressEither.right;

    if (reportData.email.addresses?.includes(validAddress)) {
      // TODO: show error?
      return;
    }

    // clear
    setAddEmailInputValue("");

    dispatchUpdateNotificationData({
      addresses: [
        validAddress,
      ] as SearchObjectDomain["reportData"]["email"]["addresses"],
    });
  };

  const handleAddressDelete = (deletedAddress: string) => {
    const validAddress = newEmailFromString(deletedAddress);
    let filteredList = reportData.email.addresses?.filter(
      (address) => address != validAddress
    );
    // can't be an empty array
    // TODO: use io-ts to make sure? (avoid the cast below)
    if (filteredList && filteredList.length == 0) {
      filteredList = undefined;
    }

    // deepmerge won't clear the list, need to update "manually"
    dispatch(
      updateReportData({
        ...reportData,
        email: {
          ...reportData.email,
          addresses:
            filteredList as SearchObjectDomain["reportData"]["email"]["addresses"],
        },
      })
    );
  };

  const isEnabled = reportData.email.status != "DISABLED";
  return (
    <>
      <Text>Email</Text>
      <ConfigContainer>
        <RowDiv>
          <LabelDiv>
            <Text>Frequency</Text>
            <Tooltip title="Daily: sent once a day at 12:00, Weekly: sent every friday">
              <InfoCircleOutlined />
            </Tooltip>
          </LabelDiv>
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
          <Text style={{ gridColumnStart: "1" }}>Add Email address</Text>
          <Input.Group
            compact
            style={{ gridColumnStart: "2", justifySelf: "end" }}
          >
            <Input
              placeholder="enter a valid email to recieve the reports"
              value={addEmailInputValue}
              disabled={!isEnabled}
              allowClear
              onChange={(event) => setAddEmailInputValue(event.target.value)}
            />
            <Button
              type="primary"
              onClick={() => handleAddressAdd(addEmailInputValue)}
              disabled={!isEnabled}
            >
              Add
            </Button>
          </Input.Group>
        </RowDiv>
        {reportData.email.addresses?.map((address) => (
          <EmailAddressItem
            address={address}
            onDelete={handleAddressDelete}
            key={address}
          />
        ))}
      </ConfigContainer>
    </>
  );
};

const EmailAddressItem: React.FC<{
  address: string;
  onDelete: (deletedAddress: string) => void;
}> = ({ address, onDelete }) => {
  return (
    <RowDiv>
      <Text>{address}</Text>
      <Button icon={<DeleteOutlined />} onClick={() => onDelete(address)} />
    </RowDiv>
  );
};
