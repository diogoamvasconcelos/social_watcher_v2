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

export const getUserIdToken = (): string | undefined => {
  const userId = getUserId();
  if (!userId) {
    return undefined;
  }

  return (
    localStorage.getItem(
      `CognitoIdentityServiceProvider.${config.cognitoClientId}.${userId}.idToken`
    ) ?? undefined
  );
};
