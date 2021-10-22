import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../shared/store";
import { JSONViewer } from "../../shared/components/JSONViewer/JSONViewer";
import { createPaymentPortal } from "./userPageState";
import { useHistory } from "react-router";
import { getUserDetails } from "../../shared/reducers/userState";
import { getConfig } from "../../shared/lib/config";
import Button from "antd/lib/button";
import Title from "antd/lib/typography/Title";

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
          gap: "10px",
          alignItems: "center",
        }}
      >
        {<JSONViewer name="user" json={user} />}
        <Button
          type="primary"
          style={{ width: "200px" }}
          onClick={handleManageSubscriptionClicked}
          loading={waitingForPortalSession}
        >
          Manage Subscription
        </Button>
      </div>
    </>
  );
};
