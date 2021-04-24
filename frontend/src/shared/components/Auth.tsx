// ref: https://gist.github.com/groundedSAGE/995dc2e14845980fdc547c8ba510169c

import Amplify, { Auth, Hub } from "aws-amplify";
import { HubCallback } from "@aws-amplify/core/lib/Hub";
import { useEffect } from "react";
import { useHistory } from "react-router";
import { useAppDispatch } from "../store";
import { onLogin, onLogout } from "../reducers/userState";
import { getConfig } from "../lib/config";

const config = getConfig();

Amplify.configure({
  Auth: {
    region: config.region,
    userPoolId: config.cognitoUserPoolId,
    userPoolWebClientId: config.cognitoClientId,
    mandatorySignIn: false,
    redirectSignIn: config.appUrl,
    redirectSignOut: config.appUrl,
  },
});

Auth.configure({
  oauth: {
    domain: config.cognitoClientDomain.replace("https://", ""),
    redirectSignIn: config.appUrl,
    redirectSignOut: config.appUrl,
    responseType: "code",
  },
});

export const WithAuth: React.FC = () => {
  const history = useHistory();
  const dispatch = useAppDispatch();

  const authListener: HubCallback = ({ payload: { event, data } }) => {
    switch (event) {
      case "signIn":
        dispatch(
          onLogin({
            id: data?.username,
            email: data?.signInUserSession?.idToken?.payload?.email,
            verified: data?.signInUserSession?.idToken?.payload?.email_verified,
          })
        );

        history.push("/user");
        break;
      case "signOut":
        dispatch(onLogout);
        history.push("/");
        break;
    }
  };

  useEffect(() => {
    Hub.listen("auth", authListener);
    return () => Hub.remove("auth", authListener);
  }, []);

  return null;
};

/*
const data_example = {
  username: "cd1c1590-ed19-4c89-86d6-de9ecbdd84cc",
  pool: {
    userPoolId: "us-east-1_BGoxkHJoy",
    clientId: "3am3e9e4ho7r9timp1ejv91np9",
    client: {
      endpoint: "https://cognito-idp.us-east-1.amazonaws.com/",
      fetchOptions: {},
    },
    advancedSecurityDataCollectionFlag: true,
    storage: {
      "CognitoIdentityServiceProvider.3am3e9e4ho7r9timp1ejv91np9.cd1c1590-ed19-4c89-86d6-de9ecbdd84cc.accessToken":
        "eyJraWQiOiJqOXFBNkdRcGY5Q2ZBQXErWEJTOXlPU3pyYTdzZ2MxK3JMTTNnTGF0WkI0PSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJjZDFjMTU5MC1lZDE5LTRjODktODZkNi1kZTllY2JkZDg0Y2MiLCJ0b2tlbl91c2UiOiJhY2Nlc3MiLCJzY29wZSI6ImF3cy5jb2duaXRvLnNpZ25pbi51c2VyLmFkbWluIG9wZW5pZCBwcm9maWxlIGVtYWlsIiwiYXV0aF90aW1lIjoxNjE5MjcxMDE4LCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV9CR294a0hKb3kiLCJleHAiOjE2MTkyNzQ2MTgsImlhdCI6MTYxOTI3MTAxOSwidmVyc2lvbiI6MiwianRpIjoiNTE1ZDk0ZGEtMzYxNS00MzMwLTkyMTktY2U1YzkwMTY1YWIzIiwiY2xpZW50X2lkIjoiM2FtM2U5ZTRobzdyOXRpbXAxZWp2OTFucDkiLCJ1c2VybmFtZSI6ImNkMWMxNTkwLWVkMTktNGM4OS04NmQ2LWRlOWVjYmRkODRjYyJ9.hyfksVVCEb6pU4lZ9fvlyn-JQaQQJyJIfge1IOMy03eCtKTdzxUSOrqgYNGy7pQSD3b1L5eMta0IZn8gCOu-uq7dBp7-WFi25jaJoGOoeZPwXKgveHFCRx-a_f2KKhl3IFOLVxfeS5Luws_9HHdbVIJextiyHJQLezPYPIXM_vrS_wKmqknnSONxggpkCRrujvAIeISVML_hD8ADZF-3p-p1QwbW7UhK7j8T7mpolrxyl9pivR2XcTDsvbMlx9kcX-VjV-qLDFbD9ZhVukcosDsb7n8R6l3CTaoc3aR80CbhHPuEJ6Z_B3NvwD6yGQQFh5D-xBShLFFnM8zf0UUAGA",
      "amplify-signin-with-hostedUI": "true",
      "CognitoIdentityServiceProvider.3am3e9e4ho7r9timp1ejv91np9.LastAuthUser":
        "cd1c1590-ed19-4c89-86d6-de9ecbdd84cc",
      "CognitoIdentityServiceProvider.3am3e9e4ho7r9timp1ejv91np9.cd1c1590-ed19-4c89-86d6-de9ecbdd84cc.refreshToken":
        "eyJjdHkiOiJKV1QiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiUlNBLU9BRVAifQ.le7rAlfOPH0s9y0eg_YbuMQ4jwe_ky9PoKLOj3yv9WpBjO3ZVfZWEGorZP5wveOmLUbFvWkBPt8_rkiWANKDbbZ-ywXWj6VsYW_HJ2yg8ilI4GlA_PGwVWMxngxw5Xz7AviqIfdDxNZwlOc1xSeoRNjyKH2S5NEEoB_eZngahn8LNc3tUnJy9TSowM4-FW7W8KB0y6xZygl3H6sPU1kz3ss5-nlq9kFksWHF1kZG3wRNMqTkSrrF1Svr7w2JLDySEMKKBikfFjCYpzKf5qiIPgeco-taNUUC49vyZzQaKHG1Vwt-LWsj2_bxjZiIU8puj7eV6Uk41UzZ1f7ZoIx-pg.ON8b8tb-YlE9Wjib.u1uXleNR-riseg1Hq3p53lgf92ejB8k4fnJp34uvn7JeIoA2CrJIpsFzUIFmv8E4H_hxhqxHkhSu60DOOVKhAwWmvLrjUvDWTXBaur7bLbD1O8ZpQcZ6MSclCRKmvzSFyxid-G4a4zeKO16PA4vgi8mRQm_xPpNPxEVhOOSSezchAyii9y3wgzHpv0vpJnpsqLo7F50BSEF1satk8L_bpmqpEE-BLZ8QGVpgm6rdi8zh27IX7O7Mz3rtfgQ3C9ujPJZm2DxlVPFitasqRpJPPd7yTOPQydFPkEi6l_ynXMoGeciyJJdZNB8YNZYyPay-FBZRCy0dgLmuqG5u0Gfx12V3m59zrnPKAEjprUtdLzMkekV6U8CdplXo2p6PREgzILz-nBTF0LhRXmNbAaf8VySJ6foKzQ_mNBlgCWJVuoSPNnA4RkOdrUTQDg7NjxjsVAXqL8_bs6Lrv6jw3Ec4Iw-ax8R0RhtW9e9v1TnsGnaJ2VY5eR7jQ1FpTVoLK9mmCKoDMtVgLU9gxuT6VFHCIOcXTRNznS_RoRd2fPLs6cobFMqaBdwXu04mp7q0rIkfbMx4ohPHhlySAJ5JC9J38x9Rta6itr3xyMJzi-g-FCK9fMihQU9SulHIiXWN3Aw_K-yUi09Y7J5XCQPyXDg_O97tnb9b_B8h_tpU80s58PI0CpOWAiO5moEuDEoy1G3a9HlIa_losVfPMKQXlOTCw9mQvjJZ6zovrCWeXOj0g3Yasd_UPGG9v-qEfoLnWv4BuYZwpjl-NBVtdUnVUavH4PPp_U3BXqbAyd2Nc0OPsOwCHa52VOBxz6nlztqJIWfmAl56oXh4vUiraEfQTbUqVjD43VsxM2Lfb8Bpim6smPQQ6lpBd2BMWZ9mDHFBq6IITw2nTGuqQ6zUSDQ7ZQBPDf6ws4RBHt0FZ0DHcykEqWEvOlV1kIVENO0x_vtKBLMTwuvgYI90iJpfLGQcKALLBRbDbowlKYVUXl8wrrHpLKHN7KgrIXbKYuTNHi1nMgmUQ1u3qIgj5b2N95wzweHAuE01DwvM7pd0b1zonkS3JqQ-_2uGdN7A3h63Nc_T8ncFplnLgHzUSvK9SWCy0V8Vwmjg1n9rLAseLNrVNIrPG4LzLIySjzZyqYbKDSBtedalmLDDaqarkeNeVMT80JojWXcwxqlNS-9JNvh9XibiCncfjv3cKE-VzEx1BIIbXbdcxNfHRbTXmQcY8Agjj_Gz-pOKSKfUqzvQSYSGr8r7N7tKF3GQoPYOT77hEmsH9PqrGxGhn1EMq3-qlsZc1KJS6EJKc2cG.CloWKaKQNO4TygxYWRvXRg",
      "user.email": "aa",
      "CognitoIdentityServiceProvider.3am3e9e4ho7r9timp1ejv91np9.cd1c1590-ed19-4c89-86d6-de9ecbdd84cc.idToken":
        "eyJraWQiOiJnVWlnVFJIV200UzBQbDV4bGdZU0NEZmRWQVlNUmNIWEdMZVVcL2VLWUxSST0iLCJhbGciOiJSUzI1NiJ9.eyJhdF9oYXNoIjoiLWoxVnNhNlAxZHRaM3VIS1QyZ1RldyIsInN1YiI6ImNkMWMxNTkwLWVkMTktNGM4OS04NmQ2LWRlOWVjYmRkODRjYyIsImF1ZCI6IjNhbTNlOWU0aG83cjl0aW1wMWVqdjkxbnA5IiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxNjE5MjcxMDE4LCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV9CR294a0hKb3kiLCJjb2duaXRvOnVzZXJuYW1lIjoiY2QxYzE1OTAtZWQxOS00Yzg5LTg2ZDYtZGU5ZWNiZGQ4NGNjIiwiZXhwIjoxNjE5Mjc0NjE4LCJpYXQiOjE2MTkyNzEwMTksImVtYWlsIjoiZGVvbjA5K3Rlc3QwMUBnbWFpbC5jb20ifQ.itPY8LI8HLKZKOlLajt4IvPQ5ZPxFcZtCeZuqRu-aBKIBTRupfau7TXcVxuTeJ1MYp-uSy_ERvw9Ti4C5VvAe-M9Kp8uo6-VjLXEOcrm8HK35Oj_QgqF67opG1bfUIImEy9EbP30zO8jm5Tlbu5_eYvoeMoHLso7Jqydk4--Hjaha1rSTkiEUCYyitMl-SBzaDymu6nPqULWBb_YOWz8-sbrAxoSAgjN14Os_hxRuKwBmG4eV8KY3x4YmuAXiRhBj23MDz5KuRlmHl2FZFRE0QosWjSeby2gUq6GF69oUcSWnLvHlpKKSXBQIXZauZRlq14LqvdSkd2OcoT92Vbb9Q",
      "amplify-redirected-from-hosted-ui": "true",
      "CognitoIdentityServiceProvider.3am3e9e4ho7r9timp1ejv91np9.cd1c1590-ed19-4c89-86d6-de9ecbdd84cc.clockDrift":
        "-1",
    },
  },
  Session: null,
  client: {
    endpoint: "https://cognito-idp.us-east-1.amazonaws.com/",
    fetchOptions: {},
  },
  signInUserSession: {
    idToken: {
      jwtToken:
        "eyJraWQiOiJnVWlnVFJIV200UzBQbDV4bGdZU0NEZmRWQVlNUmNIWEdMZVVcL2VLWUxSST0iLCJhbGciOiJSUzI1NiJ9.eyJhdF9oYXNoIjoiLWoxVnNhNlAxZHRaM3VIS1QyZ1RldyIsInN1YiI6ImNkMWMxNTkwLWVkMTktNGM4OS04NmQ2LWRlOWVjYmRkODRjYyIsImF1ZCI6IjNhbTNlOWU0aG83cjl0aW1wMWVqdjkxbnA5IiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxNjE5MjcxMDE4LCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV9CR294a0hKb3kiLCJjb2duaXRvOnVzZXJuYW1lIjoiY2QxYzE1OTAtZWQxOS00Yzg5LTg2ZDYtZGU5ZWNiZGQ4NGNjIiwiZXhwIjoxNjE5Mjc0NjE4LCJpYXQiOjE2MTkyNzEwMTksImVtYWlsIjoiZGVvbjA5K3Rlc3QwMUBnbWFpbC5jb20ifQ.itPY8LI8HLKZKOlLajt4IvPQ5ZPxFcZtCeZuqRu-aBKIBTRupfau7TXcVxuTeJ1MYp-uSy_ERvw9Ti4C5VvAe-M9Kp8uo6-VjLXEOcrm8HK35Oj_QgqF67opG1bfUIImEy9EbP30zO8jm5Tlbu5_eYvoeMoHLso7Jqydk4--Hjaha1rSTkiEUCYyitMl-SBzaDymu6nPqULWBb_YOWz8-sbrAxoSAgjN14Os_hxRuKwBmG4eV8KY3x4YmuAXiRhBj23MDz5KuRlmHl2FZFRE0QosWjSeby2gUq6GF69oUcSWnLvHlpKKSXBQIXZauZRlq14LqvdSkd2OcoT92Vbb9Q",
      payload: {
        at_hash: "-j1Vsa6P1dtZ3uHKT2gTew",
        sub: "cd1c1590-ed19-4c89-86d6-de9ecbdd84cc",
        aud: "3am3e9e4ho7r9timp1ejv91np9",
        email_verified: true,
        token_use: "id",
        auth_time: 1619271018,
        iss: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_BGoxkHJoy",
        "cognito:username": "cd1c1590-ed19-4c89-86d6-de9ecbdd84cc",
        exp: 1619274618,
        iat: 1619271019,
        email: "deon09+test01@gmail.com",
      },
    },
    refreshToken: {
      token:
        "eyJjdHkiOiJKV1QiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiUlNBLU9BRVAifQ.le7rAlfOPH0s9y0eg_YbuMQ4jwe_ky9PoKLOj3yv9WpBjO3ZVfZWEGorZP5wveOmLUbFvWkBPt8_rkiWANKDbbZ-ywXWj6VsYW_HJ2yg8ilI4GlA_PGwVWMxngxw5Xz7AviqIfdDxNZwlOc1xSeoRNjyKH2S5NEEoB_eZngahn8LNc3tUnJy9TSowM4-FW7W8KB0y6xZygl3H6sPU1kz3ss5-nlq9kFksWHF1kZG3wRNMqTkSrrF1Svr7w2JLDySEMKKBikfFjCYpzKf5qiIPgeco-taNUUC49vyZzQaKHG1Vwt-LWsj2_bxjZiIU8puj7eV6Uk41UzZ1f7ZoIx-pg.ON8b8tb-YlE9Wjib.u1uXleNR-riseg1Hq3p53lgf92ejB8k4fnJp34uvn7JeIoA2CrJIpsFzUIFmv8E4H_hxhqxHkhSu60DOOVKhAwWmvLrjUvDWTXBaur7bLbD1O8ZpQcZ6MSclCRKmvzSFyxid-G4a4zeKO16PA4vgi8mRQm_xPpNPxEVhOOSSezchAyii9y3wgzHpv0vpJnpsqLo7F50BSEF1satk8L_bpmqpEE-BLZ8QGVpgm6rdi8zh27IX7O7Mz3rtfgQ3C9ujPJZm2DxlVPFitasqRpJPPd7yTOPQydFPkEi6l_ynXMoGeciyJJdZNB8YNZYyPay-FBZRCy0dgLmuqG5u0Gfx12V3m59zrnPKAEjprUtdLzMkekV6U8CdplXo2p6PREgzILz-nBTF0LhRXmNbAaf8VySJ6foKzQ_mNBlgCWJVuoSPNnA4RkOdrUTQDg7NjxjsVAXqL8_bs6Lrv6jw3Ec4Iw-ax8R0RhtW9e9v1TnsGnaJ2VY5eR7jQ1FpTVoLK9mmCKoDMtVgLU9gxuT6VFHCIOcXTRNznS_RoRd2fPLs6cobFMqaBdwXu04mp7q0rIkfbMx4ohPHhlySAJ5JC9J38x9Rta6itr3xyMJzi-g-FCK9fMihQU9SulHIiXWN3Aw_K-yUi09Y7J5XCQPyXDg_O97tnb9b_B8h_tpU80s58PI0CpOWAiO5moEuDEoy1G3a9HlIa_losVfPMKQXlOTCw9mQvjJZ6zovrCWeXOj0g3Yasd_UPGG9v-qEfoLnWv4BuYZwpjl-NBVtdUnVUavH4PPp_U3BXqbAyd2Nc0OPsOwCHa52VOBxz6nlztqJIWfmAl56oXh4vUiraEfQTbUqVjD43VsxM2Lfb8Bpim6smPQQ6lpBd2BMWZ9mDHFBq6IITw2nTGuqQ6zUSDQ7ZQBPDf6ws4RBHt0FZ0DHcykEqWEvOlV1kIVENO0x_vtKBLMTwuvgYI90iJpfLGQcKALLBRbDbowlKYVUXl8wrrHpLKHN7KgrIXbKYuTNHi1nMgmUQ1u3qIgj5b2N95wzweHAuE01DwvM7pd0b1zonkS3JqQ-_2uGdN7A3h63Nc_T8ncFplnLgHzUSvK9SWCy0V8Vwmjg1n9rLAseLNrVNIrPG4LzLIySjzZyqYbKDSBtedalmLDDaqarkeNeVMT80JojWXcwxqlNS-9JNvh9XibiCncfjv3cKE-VzEx1BIIbXbdcxNfHRbTXmQcY8Agjj_Gz-pOKSKfUqzvQSYSGr8r7N7tKF3GQoPYOT77hEmsH9PqrGxGhn1EMq3-qlsZc1KJS6EJKc2cG.CloWKaKQNO4TygxYWRvXRg",
    },
    accessToken: {
      jwtToken:
        "eyJraWQiOiJqOXFBNkdRcGY5Q2ZBQXErWEJTOXlPU3pyYTdzZ2MxK3JMTTNnTGF0WkI0PSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJjZDFjMTU5MC1lZDE5LTRjODktODZkNi1kZTllY2JkZDg0Y2MiLCJ0b2tlbl91c2UiOiJhY2Nlc3MiLCJzY29wZSI6ImF3cy5jb2duaXRvLnNpZ25pbi51c2VyLmFkbWluIG9wZW5pZCBwcm9maWxlIGVtYWlsIiwiYXV0aF90aW1lIjoxNjE5MjcxMDE4LCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV9CR294a0hKb3kiLCJleHAiOjE2MTkyNzQ2MTgsImlhdCI6MTYxOTI3MTAxOSwidmVyc2lvbiI6MiwianRpIjoiNTE1ZDk0ZGEtMzYxNS00MzMwLTkyMTktY2U1YzkwMTY1YWIzIiwiY2xpZW50X2lkIjoiM2FtM2U5ZTRobzdyOXRpbXAxZWp2OTFucDkiLCJ1c2VybmFtZSI6ImNkMWMxNTkwLWVkMTktNGM4OS04NmQ2LWRlOWVjYmRkODRjYyJ9.hyfksVVCEb6pU4lZ9fvlyn-JQaQQJyJIfge1IOMy03eCtKTdzxUSOrqgYNGy7pQSD3b1L5eMta0IZn8gCOu-uq7dBp7-WFi25jaJoGOoeZPwXKgveHFCRx-a_f2KKhl3IFOLVxfeS5Luws_9HHdbVIJextiyHJQLezPYPIXM_vrS_wKmqknnSONxggpkCRrujvAIeISVML_hD8ADZF-3p-p1QwbW7UhK7j8T7mpolrxyl9pivR2XcTDsvbMlx9kcX-VjV-qLDFbD9ZhVukcosDsb7n8R6l3CTaoc3aR80CbhHPuEJ6Z_B3NvwD6yGQQFh5D-xBShLFFnM8zf0UUAGA",
      payload: {
        sub: "cd1c1590-ed19-4c89-86d6-de9ecbdd84cc",
        token_use: "access",
        scope: "aws.cognito.signin.user.admin openid profile email",
        auth_time: 1619271018,
        iss: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_BGoxkHJoy",
        exp: 1619274618,
        iat: 1619271019,
        version: 2,
        jti: "515d94da-3615-4330-9219-ce5c90165ab3",
        client_id: "3am3e9e4ho7r9timp1ejv91np9",
        username: "cd1c1590-ed19-4c89-86d6-de9ecbdd84cc",
      },
    },
    clockDrift: -1,
  },
  authenticationFlowType: "USER_SRP_AUTH",
  storage: {
    "CognitoIdentityServiceProvider.3am3e9e4ho7r9timp1ejv91np9.cd1c1590-ed19-4c89-86d6-de9ecbdd84cc.accessToken":
      "eyJraWQiOiJqOXFBNkdRcGY5Q2ZBQXErWEJTOXlPU3pyYTdzZ2MxK3JMTTNnTGF0WkI0PSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJjZDFjMTU5MC1lZDE5LTRjODktODZkNi1kZTllY2JkZDg0Y2MiLCJ0b2tlbl91c2UiOiJhY2Nlc3MiLCJzY29wZSI6ImF3cy5jb2duaXRvLnNpZ25pbi51c2VyLmFkbWluIG9wZW5pZCBwcm9maWxlIGVtYWlsIiwiYXV0aF90aW1lIjoxNjE5MjcxMDE4LCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV9CR294a0hKb3kiLCJleHAiOjE2MTkyNzQ2MTgsImlhdCI6MTYxOTI3MTAxOSwidmVyc2lvbiI6MiwianRpIjoiNTE1ZDk0ZGEtMzYxNS00MzMwLTkyMTktY2U1YzkwMTY1YWIzIiwiY2xpZW50X2lkIjoiM2FtM2U5ZTRobzdyOXRpbXAxZWp2OTFucDkiLCJ1c2VybmFtZSI6ImNkMWMxNTkwLWVkMTktNGM4OS04NmQ2LWRlOWVjYmRkODRjYyJ9.hyfksVVCEb6pU4lZ9fvlyn-JQaQQJyJIfge1IOMy03eCtKTdzxUSOrqgYNGy7pQSD3b1L5eMta0IZn8gCOu-uq7dBp7-WFi25jaJoGOoeZPwXKgveHFCRx-a_f2KKhl3IFOLVxfeS5Luws_9HHdbVIJextiyHJQLezPYPIXM_vrS_wKmqknnSONxggpkCRrujvAIeISVML_hD8ADZF-3p-p1QwbW7UhK7j8T7mpolrxyl9pivR2XcTDsvbMlx9kcX-VjV-qLDFbD9ZhVukcosDsb7n8R6l3CTaoc3aR80CbhHPuEJ6Z_B3NvwD6yGQQFh5D-xBShLFFnM8zf0UUAGA",
    "amplify-signin-with-hostedUI": "true",
    "CognitoIdentityServiceProvider.3am3e9e4ho7r9timp1ejv91np9.LastAuthUser":
      "cd1c1590-ed19-4c89-86d6-de9ecbdd84cc",
    "CognitoIdentityServiceProvider.3am3e9e4ho7r9timp1ejv91np9.cd1c1590-ed19-4c89-86d6-de9ecbdd84cc.refreshToken":
      "eyJjdHkiOiJKV1QiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiUlNBLU9BRVAifQ.le7rAlfOPH0s9y0eg_YbuMQ4jwe_ky9PoKLOj3yv9WpBjO3ZVfZWEGorZP5wveOmLUbFvWkBPt8_rkiWANKDbbZ-ywXWj6VsYW_HJ2yg8ilI4GlA_PGwVWMxngxw5Xz7AviqIfdDxNZwlOc1xSeoRNjyKH2S5NEEoB_eZngahn8LNc3tUnJy9TSowM4-FW7W8KB0y6xZygl3H6sPU1kz3ss5-nlq9kFksWHF1kZG3wRNMqTkSrrF1Svr7w2JLDySEMKKBikfFjCYpzKf5qiIPgeco-taNUUC49vyZzQaKHG1Vwt-LWsj2_bxjZiIU8puj7eV6Uk41UzZ1f7ZoIx-pg.ON8b8tb-YlE9Wjib.u1uXleNR-riseg1Hq3p53lgf92ejB8k4fnJp34uvn7JeIoA2CrJIpsFzUIFmv8E4H_hxhqxHkhSu60DOOVKhAwWmvLrjUvDWTXBaur7bLbD1O8ZpQcZ6MSclCRKmvzSFyxid-G4a4zeKO16PA4vgi8mRQm_xPpNPxEVhOOSSezchAyii9y3wgzHpv0vpJnpsqLo7F50BSEF1satk8L_bpmqpEE-BLZ8QGVpgm6rdi8zh27IX7O7Mz3rtfgQ3C9ujPJZm2DxlVPFitasqRpJPPd7yTOPQydFPkEi6l_ynXMoGeciyJJdZNB8YNZYyPay-FBZRCy0dgLmuqG5u0Gfx12V3m59zrnPKAEjprUtdLzMkekV6U8CdplXo2p6PREgzILz-nBTF0LhRXmNbAaf8VySJ6foKzQ_mNBlgCWJVuoSPNnA4RkOdrUTQDg7NjxjsVAXqL8_bs6Lrv6jw3Ec4Iw-ax8R0RhtW9e9v1TnsGnaJ2VY5eR7jQ1FpTVoLK9mmCKoDMtVgLU9gxuT6VFHCIOcXTRNznS_RoRd2fPLs6cobFMqaBdwXu04mp7q0rIkfbMx4ohPHhlySAJ5JC9J38x9Rta6itr3xyMJzi-g-FCK9fMihQU9SulHIiXWN3Aw_K-yUi09Y7J5XCQPyXDg_O97tnb9b_B8h_tpU80s58PI0CpOWAiO5moEuDEoy1G3a9HlIa_losVfPMKQXlOTCw9mQvjJZ6zovrCWeXOj0g3Yasd_UPGG9v-qEfoLnWv4BuYZwpjl-NBVtdUnVUavH4PPp_U3BXqbAyd2Nc0OPsOwCHa52VOBxz6nlztqJIWfmAl56oXh4vUiraEfQTbUqVjD43VsxM2Lfb8Bpim6smPQQ6lpBd2BMWZ9mDHFBq6IITw2nTGuqQ6zUSDQ7ZQBPDf6ws4RBHt0FZ0DHcykEqWEvOlV1kIVENO0x_vtKBLMTwuvgYI90iJpfLGQcKALLBRbDbowlKYVUXl8wrrHpLKHN7KgrIXbKYuTNHi1nMgmUQ1u3qIgj5b2N95wzweHAuE01DwvM7pd0b1zonkS3JqQ-_2uGdN7A3h63Nc_T8ncFplnLgHzUSvK9SWCy0V8Vwmjg1n9rLAseLNrVNIrPG4LzLIySjzZyqYbKDSBtedalmLDDaqarkeNeVMT80JojWXcwxqlNS-9JNvh9XibiCncfjv3cKE-VzEx1BIIbXbdcxNfHRbTXmQcY8Agjj_Gz-pOKSKfUqzvQSYSGr8r7N7tKF3GQoPYOT77hEmsH9PqrGxGhn1EMq3-qlsZc1KJS6EJKc2cG.CloWKaKQNO4TygxYWRvXRg",
    "user.email": "aa",
    "CognitoIdentityServiceProvider.3am3e9e4ho7r9timp1ejv91np9.cd1c1590-ed19-4c89-86d6-de9ecbdd84cc.idToken":
      "eyJraWQiOiJnVWlnVFJIV200UzBQbDV4bGdZU0NEZmRWQVlNUmNIWEdMZVVcL2VLWUxSST0iLCJhbGciOiJSUzI1NiJ9.eyJhdF9oYXNoIjoiLWoxVnNhNlAxZHRaM3VIS1QyZ1RldyIsInN1YiI6ImNkMWMxNTkwLWVkMTktNGM4OS04NmQ2LWRlOWVjYmRkODRjYyIsImF1ZCI6IjNhbTNlOWU0aG83cjl0aW1wMWVqdjkxbnA5IiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxNjE5MjcxMDE4LCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV9CR294a0hKb3kiLCJjb2duaXRvOnVzZXJuYW1lIjoiY2QxYzE1OTAtZWQxOS00Yzg5LTg2ZDYtZGU5ZWNiZGQ4NGNjIiwiZXhwIjoxNjE5Mjc0NjE4LCJpYXQiOjE2MTkyNzEwMTksImVtYWlsIjoiZGVvbjA5K3Rlc3QwMUBnbWFpbC5jb20ifQ.itPY8LI8HLKZKOlLajt4IvPQ5ZPxFcZtCeZuqRu-aBKIBTRupfau7TXcVxuTeJ1MYp-uSy_ERvw9Ti4C5VvAe-M9Kp8uo6-VjLXEOcrm8HK35Oj_QgqF67opG1bfUIImEy9EbP30zO8jm5Tlbu5_eYvoeMoHLso7Jqydk4--Hjaha1rSTkiEUCYyitMl-SBzaDymu6nPqULWBb_YOWz8-sbrAxoSAgjN14Os_hxRuKwBmG4eV8KY3x4YmuAXiRhBj23MDz5KuRlmHl2FZFRE0QosWjSeby2gUq6GF69oUcSWnLvHlpKKSXBQIXZauZRlq14LqvdSkd2OcoT92Vbb9Q",
    "amplify-redirected-from-hosted-ui": "true",
    "CognitoIdentityServiceProvider.3am3e9e4ho7r9timp1ejv91np9.cd1c1590-ed19-4c89-86d6-de9ecbdd84cc.clockDrift":
      "-1",
  },
  keyPrefix: "CognitoIdentityServiceProvider.3am3e9e4ho7r9timp1ejv91np9",
  userDataKey:
    "CognitoIdentityServiceProvider.3am3e9e4ho7r9timp1ejv91np9.cd1c1590-ed19-4c89-86d6-de9ecbdd84cc.userData",
};
*/
