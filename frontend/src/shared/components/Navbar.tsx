import React from "react";
import { Link, useHistory } from "react-router-dom";
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
          <NavButton type="text" onClick={() => gotoCognitoLogin()}>
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

const gotoCognitoLogin = () => {
  const cognitoDomain = process.env.COGNITO_CLIENT_DOMAIN;
  const cognitoClientId = process.env.COGNITO_CLIENT_ID;
  const appUrl = process.env.APP_URL;

  const loginUrl = `${cognitoDomain}/login?client_id=${cognitoClientId}&redirect_uri=${appUrl}&response_type=code`;
  //const logoutUrl = `${cognitoDomain}/logout?client_id=${cognitoClientId}&logout_uri=${appUrl}`;

  console.log(loginUrl);
  location.assign(loginUrl);
};
