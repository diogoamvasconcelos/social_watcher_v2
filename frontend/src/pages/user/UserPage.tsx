import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../shared/store";
import { JSONViewer } from "../../shared/components/JSONViewer/JSONViewer";
import { createPaymentPortal } from "./userPageState";
import { useHistory } from "react-router";
import { getUserDetails } from "../../shared/reducers/userState";
import { getConfig } from "../../shared/lib/config";
import Title from "antd/lib/typography/Title";
import { ElevatedPrimaryButton } from "@src/shared/style/components/button";
import { size } from "@src/shared/style/sizing";

const config = getConfig();

export const UserPage: React.FC = () => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const [waitingForPortalSession, setWaitingForPortalSession] = useState(false);

  const user = useAppSelector((state) => state.user.details);
  const portalSessionUrl = useAppSelector((state) => state.userPage.sessionUrl);

  const handleManageSubscriptionClicked = () => {
    void dispatch(
      createPaymentPortal([
        {
          returnUrl: `${config.appUrl}${history.location.pathname}`,
        },
      ])
    );

    setWaitingForPortalSession(true);
  };

  useEffect(() => {
    void dispatch(getUserDetails());
  }, []);

  useEffect(() => {
    if (portalSessionUrl != "") {
      setWaitingForPortalSession(false);
      location.assign(portalSessionUrl);
    }
  }, [portalSessionUrl]);

  return (
    <>
      <Title level={4}>User</Title>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: size.size16px,
          alignItems: "center",
          padding: size.size32px,
        }}
      >
        {<JSONViewer name="user" json={user} darkMode={true} />}
        <ElevatedPrimaryButton
          size="large"
          type="primary"
          onClick={handleManageSubscriptionClicked}
          loading={waitingForPortalSession}
        >
          Manage Subscription
        </ElevatedPrimaryButton>
      </div>
    </>
  );
};
