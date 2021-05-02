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

const App: React.FC = () => (
  <Provider store={store}>
    <BrowserRouter>
      <WithAuth />
      <Layout className="layout">
        <Navbar />
        <Layout.Content>
          <Switch>
            <Route path="/dashboard" component={DashboardPage} />
            <Route path="/user" component={UserPage} />
            <Route path="/">
              <p>Work in Progress</p>
            </Route>
          </Switch>
        </Layout.Content>
        <p style={{ textAlign: "center" }}>Footer placeholder</p>
      </Layout>
    </BrowserRouter>
  </Provider>
);
export default App;
