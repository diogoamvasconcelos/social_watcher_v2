import React from "react";
import { Link } from "react-router-dom";
import { Button, Layout } from "antd";
import logo from "../../../assets/logo-navbar.jpg";
import styled from "styled-components";

const { Header } = Layout;

const NavbarContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const LogoContainer = styled.div`
  flex-grow: 1;
`;

const ButtonsContainer = styled.div``;

const NavButton = styled(Button)`
  color: white;
  :hover {
    color: gray;
  }
`;

export const Navbar: React.FC = () => {
  return (
    <Header>
      <NavbarContainer>
        <LogoContainer>
          <Link to="/">
            <img src={logo} alt="Social Watcher logo" />
          </Link>
        </LogoContainer>
        <ButtonsContainer>
          <NavButton type="text" onClick={() => console.log("Log in")}>
            Log in
          </NavButton>
          <NavButton type="primary" onClick={() => console.log("sign up")}>
            Start free trial
          </NavButton>
        </ButtonsContainer>
      </NavbarContainer>
    </Header>
  );
};
