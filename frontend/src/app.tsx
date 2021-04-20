import "./App.css";
import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { Layout, Comment, Button } from "antd";
import { Navbar } from "./shared/components/Navbar";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Layout className="layout">
        <Navbar />
        <Layout.Content>
          <Switch>
            <Route path="/" component={Comment} />
            <Route path="/test" component={Button} />
          </Switch>
        </Layout.Content>
        <p>footer</p>
      </Layout>
    </BrowserRouter>
  );
};
export default App;
