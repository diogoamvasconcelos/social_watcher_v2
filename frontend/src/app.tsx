import "./App.css";
import React, { StrictMode } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { Navbar } from "./shared/components/Navbar";
import { WithAuth } from "./shared/components/Auth";
import { UserPage } from "./pages/user/UserPage";
import { Provider } from "react-redux";
import { store } from "./shared/store";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { NotFoundPage } from "./pages/misc/notFoundPage";
import { SigninPage } from "./pages/signin/SigninPage";
import Layout from "antd/lib/layout";
import {
  USER_PATH,
  DASHBOARD_PATH,
  ROOT_PATH,
  SIGNUP_PATH,
  LOGIN_PATH,
  TERMS_AND_CONDITIONS_PATH,
  PRIVACY_POLICY_PATH,
} from "./shared/data/paths";
import { LandingPage } from "./pages/landing/LandingPage";
import { TermsPage } from "./pages/terms/TermsPage";
import { PrivacyPage } from "./pages/terms/PrivacyPage";
import { Footer } from "./shared/components/Footer";
import styled from "styled-components";
import { CookieBanner } from "./shared/components/CookieBanner";
import { colors } from "./shared/style/colors";

const LayoutStyled = styled(Layout)`
  background-color: ${colors.neutral.light2};
`;

const App: React.FC = () => (
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <WithAuth />
        <LayoutStyled className="layout">
          <Navbar />
          <Layout.Content>
            <Switch>
              <Route path={ROOT_PATH} exact component={LandingPage} />
              <Route path={DASHBOARD_PATH} component={DashboardPage} />
              <Route path={USER_PATH} component={UserPage} />
              <Route path={[SIGNUP_PATH, LOGIN_PATH]} component={SigninPage} />
              <Route path={TERMS_AND_CONDITIONS_PATH} component={TermsPage} />
              <Route path={PRIVACY_POLICY_PATH} component={PrivacyPage} />
              <Route component={NotFoundPage} />
            </Switch>
          </Layout.Content>
          <Footer />
        </LayoutStyled>
        <CookieBanner />
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
export default App;
