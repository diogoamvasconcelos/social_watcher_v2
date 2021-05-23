import { ensureString } from "@diogovasconcelos/lib";

export const getConfig = () => {
  return {
    env: ensureString(process.env.ENV),
    region: ensureString(process.env.AWS_REGION),
    cognitoClientId: ensureString(process.env.COGNITO_CLIENT_ID),
    cognitoUserPoolId: ensureString(process.env.COGNITO_USER_POOL_ID),
    cognitoClientDomain: ensureString(process.env.COGNITO_CLIENT_DOMAIN),
    apiEndpoint: ensureString(process.env.API_ENDPOINT),
    appUrl: ensureString(process.env.APP_URL),
  };
};

export type Config = ReturnType<typeof getConfig>;
