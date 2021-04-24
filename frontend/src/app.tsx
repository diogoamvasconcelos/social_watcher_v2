import "./App.css";
import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { Layout } from "antd";
import { Navbar } from "./shared/components/Navbar";
import { WithAuth } from "./shared/components/Auth";

const App: React.FC = () => (
  <BrowserRouter>
    <WithAuth />
    <Layout className="layout">
      <Navbar />
      <Layout.Content>
        <Switch>
          <Route path="/">
            <p>GONNA BE GOOD</p>
          </Route>
        </Switch>
      </Layout.Content>
      <p style={{ textAlign: "center" }}>Footer placeholder</p>
    </Layout>
  </BrowserRouter>
);
export default App;
