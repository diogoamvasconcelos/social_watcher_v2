import React from "react";
import { Link } from "react-router-dom";
import { Button, Layout } from "antd";
import logo from "url:../../../assets/logo-navbar.jpg";
import styled from "styled-components";
import { Auth } from "aws-amplify";
import { useAppSelector } from "../store";
import { getConfig } from "../lib/config";

const { Header } = Layout;

const config = getConfig();

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

const NotLoggedButtons: React.FC = () => {
  return (
    <ButtonsContainer>
      <NavButton type="text" onClick={() => handleLoginClicked()}>
        Log in
      </NavButton>
      <NavButton type="primary" onClick={() => console.log("sign up")}>
        Start free trial
      </NavButton>
    </ButtonsContainer>
  );
};

const LoggedButtons: React.FC = () => {
  return (
    <ButtonsContainer>
      <NavButton type="text" onClick={async () => await handleLogoutClicked()}>
        Log out
      </NavButton>
    </ButtonsContainer>
  );
};

export const Navbar: React.FC = () => {
  const userID = useAppSelector((state) => state.userAuth.id);

  return (
    <Header>
      <NavbarContainer>
        <LogoContainer>
          <Link to="/">
            <img src={logo} alt="Social Watcher logo" />
          </Link>
        </LogoContainer>
        {userID ? <LoggedButtons /> : <NotLoggedButtons />}
      </NavbarContainer>
    </Header>
  );
};

const handleLoginClicked = () => {
  const cognitoDomain = config.cognitoClientDomain;
  const cognitoClientId = config.cognitoClientId;
  const appUrl = config.appUrl;

  const loginUrl = `${cognitoDomain}/login?client_id=${cognitoClientId}&redirect_uri=${appUrl}&response_type=code`;

  location.assign(loginUrl);
};

const handleLogoutClicked = async () => {
  await Auth.signOut();
};
