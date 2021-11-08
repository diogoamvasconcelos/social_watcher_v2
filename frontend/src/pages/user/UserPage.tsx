import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../shared/store";
import { JSONViewer } from "../../shared/components/JSONViewer/JSONViewer";
import { createPaymentPortal } from "./userPageState";
import { useHistory } from "react-router";
import { getUserDetails } from "../../shared/reducers/userState";
import { getConfig } from "../../shared/lib/config";
import Text from "antd/lib/typography/Text";
import { ElevatedPrimaryButton } from "@src/shared/style/components/button";
import { radius, size } from "@src/shared/style/sizing";
import styled from "styled-components";
import { fontSize } from "@src/shared/style/fonts";
import { colors } from "@src/shared/style/colors";

const config = getConfig();

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const Title = styled(Text)`
  text-align: center;
  font-size: ${fontSize.size24px};
  color: ${colors.neutral.dark2};
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${size.size16px};
  padding: ${size.size32px};
`;

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
    <PageContainer>
      <Title>Your Account</Title>
      <ContentContainer>
        {
          <JSONViewer
            name="user"
            json={user}
            darkMode={true}
            // Styled component does not work with JSONViewer
            style={{
              width: "100%",
              maxWidth: "600px",
              borderRadius: radius.radius8px,
              padding: size.size16px,
            }}
          />
        }
        <ElevatedPrimaryButton
          size="large"
          type="primary"
          onClick={handleManageSubscriptionClicked}
          loading={waitingForPortalSession}
        >
          Manage Subscription
        </ElevatedPrimaryButton>
      </ContentContainer>
    </PageContainer>
  );
};
