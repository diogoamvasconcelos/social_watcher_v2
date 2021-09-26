import React from "react";
import {
  AmplifyAuthenticator,
  AmplifySignUp,
  AmplifySignIn,
  AmplifySignOut,
} from "@aws-amplify/ui-react";
import { AuthState } from "@aws-amplify/ui-components";
import styled from "styled-components";
import { useHistory } from "react-router-dom";
import { SIGNUP_PATH } from "@src/shared/data/paths";
import qs from "query-string";
import { decode, toRightOrUndefined } from "@diogovasconcelos/lib/iots";
import * as t from "io-ts";
import { useAppDispatch } from "@src/shared/store";
import { hasUserSession } from "@src/shared/lib/userSession";
import { setLoginRedirectUrl } from "@src/shared/reducers/redirectState";
import { useEffect } from "react";

const StyledAmplifyAuth = styled(AmplifyAuthenticator)`
  --amplify-background-color: #d9e2ec;
  --amplify-primary-color: #334e68;
  --amplify-primary-tint: #bcccdc;
  --amplify-primary-shade: #102a43;
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
    <>
      <p>Already logged-in</p>
      <AmplifySignOut />
    </>
  ) : (
    <>
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
    </>
  );
};
