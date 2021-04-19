import "./App.css";
import React from "react";
import { BrowserRouter, Route } from "react-router-dom";
import { Layout, Comment } from "antd";

const App: React.FC = () => {
  return (
    <Layout className="layout">
      <p>header</p>
      <Layout.Content>
        <BrowserRouter>
          <Route path="/" component={Comment} />
        </BrowserRouter>
      </Layout.Content>
      <p>footer</p>
    </Layout>
  );
};
export default App;
