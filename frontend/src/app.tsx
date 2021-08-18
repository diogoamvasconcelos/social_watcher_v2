import "./App.css";
import React, { StrictMode } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { Navbar } from "./shared/components/Navbar";
import { WithAuth } from "./shared/components/Auth";
import { UserPage } from "./pages/user/UserPage";
import { Provider } from "react-redux";
import { store } from "./shared/store";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { TodoPage } from "./pages/misc/TodoPage";
import { NotFoundPage } from "./pages/misc/notFoundPage";
import { SignupPage } from "./pages/signup/SignupPage";
import Layout from "antd/lib/layout";
import {
  USER_PATH,
  DASHBOARD_PATH,
  ROOT_PATH,
  GUIDES_PATH,
  PRICING_PATH,
  ABOUT_PATH,
  SIGNUP_PATH,
} from "./shared/data/paths";

const App: React.FC = () => (
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <WithAuth />
        <Layout className="layout">
          <Navbar />
          <Layout.Content>
            <Switch>
              <Route path={ROOT_PATH} exact>
                <p>Work in Progress</p>
              </Route>
              <Route path={DASHBOARD_PATH} component={DashboardPage} />
              <Route path={USER_PATH} component={UserPage} />
              <Route path={GUIDES_PATH} component={TodoPage} />
              <Route path={PRICING_PATH} component={TodoPage} />
              <Route path={ABOUT_PATH} component={TodoPage} />
              <Route path={SIGNUP_PATH} component={SignupPage} />
              <Route component={NotFoundPage} />
            </Switch>
          </Layout.Content>
          <p style={{ textAlign: "center" }}>Footer placeholder</p>
        </Layout>
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
export default App;
