import React from "react";
import { Link } from "react-router-dom";
import { Button, Input, Layout, Image } from "antd";
import logo from "../../../assets/logo.jpg";

const { Search } = Input;
const { Header } = Layout;

export const Navbar: React.FC = () => {
  return (
    <Layout className="layout">
      <Header>
        <div>
          <Link to="/">
            <img src={logo} alt="Social Watcher logo" />
          </Link>
        </div>
        <Button type="primary" onClick={() => console.log("Log in")}>
          Log in
        </Button>
      </Header>
    </Layout>
  );
};
