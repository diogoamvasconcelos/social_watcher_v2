import React from "react";
import {
  AmplifyAuthenticator,
  AmplifySignUp,
  AmplifySignIn,
  AmplifySignOut,
} from "@aws-amplify/ui-react";
import { AuthState } from "@aws-amplify/ui-components";
import styled from "styled-components";
import Text from "antd/lib/typography/Text";
import { useHistory } from "react-router-dom";
import { SIGNUP_PATH } from "@src/shared/data/paths";
import qs from "query-string";
import { decode, toRightOrUndefined } from "@diogovasconcelos/lib/iots";
import * as t from "io-ts";
import { useAppDispatch } from "@src/shared/store";
import { hasUserSession } from "@src/shared/lib/userSession";
import { setLoginRedirectUrl } from "@src/shared/reducers/redirectState";
import { useEffect } from "react";
import { colors } from "@src/shared/style/colors";
import { radius, size } from "@src/shared/style/sizing";
import { fontSize } from "@src/shared/style/fonts";

const PageContainer = styled.div`
  background-color: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${size.size16px};
  padding: ${size.size32px};
`;

const Heading = styled(Text)`
  font-size: ${fontSize.size24px};
  color: ${colors.neutral.dark3};
`;

const StyledAmplifyAuth = styled(AmplifyAuthenticator)`
  --amplify-primary-color: ${colors.primary.medium2};
`;

const StyledAmplifySignOut = styled(AmplifySignOut)`
  --amplify-background-color: ${colors.neutral.light15};
  --amplify-primary-color: ${colors.primary.medium2};
  --amplify-primary-tint: ${colors.primary.dark1};
  --amplify-primary-shade: ${colors.neutral.dark2};

  --border-radius: ${radius.radius16px};
  --box-shadow: 0 2px 5px hsla(0, 0%, 0%, 0.2);
`;

export const SigninPage: React.FC = () => {
  const history = useHistory();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const s = qs.parse(history.location.search);
    const redirectUrl = toRightOrUndefined(decode(t.string, s.redirectUrl));

    dispatch(setLoginRedirectUrl(redirectUrl));
  }, [history.location]);

  const isSignUp = history.location.pathname === SIGNUP_PATH;
  const alreadyLoggedIn = hasUserSession();

  return alreadyLoggedIn ? (
    <PageContainer>
      <Heading>Already logged-in</Heading>
      <StyledAmplifySignOut />
    </PageContainer>
  ) : (
    <PageContainer>
      <StyledAmplifyAuth
        usernameAlias="email"
        initialAuthState={isSignUp ? AuthState.SignUp : AuthState.SignIn}
      >
        <AmplifySignUp
          slot="sign-up"
          usernameAlias="email"
          formFields={[
            {
              type: "email",
              label: "Email Address",
              placeholder: "Enter a valid email address",
              inputProps: { required: true, autocomplete: "aaaa" },
            },
            {
              type: "password",
              label: "Password",
              placeholder: "At least 10 characters in length",
              inputProps: { required: true },
            },
          ]}
        />
        <AmplifySignIn slot="sign-in" usernameAlias="email" />
      </StyledAmplifyAuth>
    </PageContainer>
  );
};
