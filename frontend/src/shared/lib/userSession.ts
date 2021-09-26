import Auth from "@aws-amplify/auth/lib";
import { getConfig } from "./config";

const config = getConfig();

export const hasUserSession = (): boolean => {
  return getUserId() != undefined;
};

export const getUserId = (): string | undefined => {
  return (
    localStorage.getItem(
      `CognitoIdentityServiceProvider.${config.cognitoClientId}.LastAuthUser`
    ) ?? undefined
  );
};

export const getUserIdToken = async () => {
  const session = await Auth.currentSession(); // this refreshes the token if expired
  return session.getIdToken().getJwtToken();
};
// export const getUserIdToken = (): string | undefined => {
//   const userId = getUserId();
//   if (!userId) {
//     return undefined;
//   }

//   return (
//     localStorage.getItem(
//       `CognitoIdentityServiceProvider.${config.cognitoClientId}.${userId}.idToken`
//     ) ?? undefined
//   );
// };
