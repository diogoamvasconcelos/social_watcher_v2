import "./App.css";
import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { Layout } from "antd";
import { Navbar } from "./shared/components/Navbar";
import { WithAuth } from "./shared/components/Auth";
import { UserPage } from "./pages/user/UserPage";
import { Provider } from "react-redux";
import { store } from "./shared/store";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { TodoPage } from "./pages/misc/TodoPage";
import { NotFoundPage } from "./pages/misc/notFoundPage";
import { SignupPage } from "./pages/signup/SignupPage";

const App: React.FC = () => (
  <Provider store={store}>
    <BrowserRouter>
      <WithAuth />
      <Layout className="layout">
        <Navbar />
        <Layout.Content>
          <Switch>
            <Route path="/" exact>
              <p>Work in Progress</p>
            </Route>
            <Route path="/user/dashboard" component={DashboardPage} />
            <Route path="/user/account" component={UserPage} />
            <Route path="/user/guides" component={TodoPage} />
            <Route path="/pricing" component={TodoPage} />
            <Route path="/about" component={TodoPage} />
            <Route path="/signup" component={SignupPage} />
            <Route component={NotFoundPage} />
          </Switch>
        </Layout.Content>
        <p style={{ textAlign: "center" }}>Footer placeholder</p>
      </Layout>
    </BrowserRouter>
  </Provider>
);
export default App;
