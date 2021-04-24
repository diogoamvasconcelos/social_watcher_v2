import Amplify, { Auth, Hub } from "aws-amplify";
import { HubCallback } from "@aws-amplify/core/lib/Hub";
import { useEffect } from "react";

Amplify.configure({
  Auth: {
    region: process.env.AWS_REGION,
    userPoolId: process.env.COGNITO_USER_POOL_ID,
    userPoolWebClientId: process.env.COGNITO_CLIENT_ID,
    mandatorySignIn: false,
    redirectSignIn: process.env.APP_URL,
    redirectSignOut: process.env.APP_URL,
  },
});

Auth.configure({
  oauth: {
    domain: (process.env.COGNITO_CLIENT_DOMAIN ?? "").replace("https://", ""),
    redirectSignIn: process.env.APP_URL,
    redirectSignOut: process.env.APP_URL,
    responseType: "code",
  },
});

export const WithAuth: React.FC = () => {
  const authListener: HubCallback = ({ payload: { event, data } }) => {
    switch (event) {
      case "signIn":
        console.log("sign in");
        console.log(data);
        break;
      case "signOut":
        console.log("sign out");
        console.log(data);
        break;
    }
  };

  useEffect(() => {
    Hub.listen("auth", authListener);
    return () => Hub.remove("auth", authListener);
  }, []);

  return null;
};
