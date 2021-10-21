import React, { useEffect } from "react";
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
  };

  useEffect(() => {
    void dispatch(getUserDetails());
  }, []);

  useEffect(() => {
    if (portalSessionUrl != "") {
      location.assign(portalSessionUrl);
    }
  }, [portalSessionUrl]);

  return (
    <>
      <Title level={4}>User</Title>
      {<JSONViewer name="user" json={user} />}
      <Button type="primary" onClick={handleManageSubscriptionClicked}>
        Manage Subscription
      </Button>
    </>
  );
};
