const cognitoClientId = process.env.COGNITO_CLIENT_ID ?? "";

export const hasUserSession = (): boolean => {
  return getUserId() != undefined;
};

export const getUserId = (): string | undefined => {
  return (
    localStorage.getItem(
      `CognitoIdentityServiceProvider.${cognitoClientId}.LastAuthUser`
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
      `CognitoIdentityServiceProvider.${cognitoClientId}.${userId}.idToken`
    ) ?? undefined
  );
};
