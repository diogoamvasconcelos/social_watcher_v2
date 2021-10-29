import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import logo from "../../../assets/logo-navbar.jpg";
import styled from "styled-components";
import Auth from "@aws-amplify/auth/lib";
import { useAppSelector } from "../store";
import { MenuClickEventHandler } from "rc-menu/lib/interface";
import { useLocationChanged } from "../lib/react";
import { getConfig } from "../lib/config";
import _findKey from "lodash/findKey";
import Text from "antd/lib/typography/Text";
import Menu from "antd/lib/menu";
import Button from "antd/lib/button";
import Dropdown from "antd/lib/dropdown";
import UserOutlined from "@ant-design/icons/lib/icons/UserOutlined";
import { Header } from "antd/lib/layout/layout";
import {
  FAQ_PATH,
  DASHBOARD_PATH,
  PRICING_PATH,
  ROOT_PATH,
  SIGNUP_PATH,
  USER_PATH,
  LOGIN_PATH,
} from "../data/paths";
import { UserAuthStateDetails } from "../reducers/userAuthState";
import { hasUserSession } from "../lib/userSession";

const config = getConfig();

const navigationConfig: Record<string, string> = {
  product: ROOT_PATH,
  pricing: PRICING_PATH,
  faq: FAQ_PATH,
  dashboard: DASHBOARD_PATH,
};

type TopMenuProps = {
  inUserSubPage: boolean;
  userLoggedIn: boolean;
};
const TopMenu: React.FC<TopMenuProps> = ({ inUserSubPage, userLoggedIn }) => {
  const history = useHistory();

  const [state, setState] = useState<{ selectedKeys: string[] }>({
    selectedKeys: [],
  });

  useLocationChanged((location) => {
    const currentKey = _findKey(
      navigationConfig,
      (path) => location.pathname == path
    );
    setState({ selectedKeys: currentKey ? [currentKey] : [] });
  });

  const handleClick: MenuClickEventHandler = ({ key }) => {
    setState({ selectedKeys: [key.toString()] });
    history.push(navigationConfig[key.toString()]);
  };

  const buttons: JSX.Element[] = [];
  if (!inUserSubPage) {
    buttons.push(
      <Menu.Item key="product">Product</Menu.Item>,
      <Menu.Item key="pricing">Pricing</Menu.Item>,
      <Menu.Item key="faq">FAQ</Menu.Item>
    );
  }

  if (userLoggedIn) {
    buttons.push(<Menu.Item key="dashboard">Dashboard</Menu.Item>);
  }

  return (
    <Menu
      mode="horizontal"
      onClick={handleClick}
      selectedKeys={state.selectedKeys}
      style={{ width: "360px" }}
    >
      {buttons}
    </Menu>
  );
};

const ButtonsContainer = styled.div`
  margin: 8px;
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;
`;

const LoginButton = styled(Button)`
  color: white;
  :hover {
    color: gray;
  }
`;

type UserProfileProps = {
  userDetails: UserAuthStateDetails;
};

const UserProfile: React.FC<UserProfileProps> = ({ userDetails }) => {
  const history = useHistory();

  const handleItemClicked: MenuClickEventHandler = async ({ key }) => {
    switch (key.toString()) {
      case "account": {
        history.push(USER_PATH);
        break;
      }
      case "logout": {
        await Auth.signOut();
        break;
      }
    }
  };

  const menu = (
    <Menu onClick={handleItemClicked}>
      <Menu.Item style={{ pointerEvents: "none" }} key="email">
        {/*makes it not clickable/selectable*/}
        <Text>{userDetails.email}</Text>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="account">
        <Text>Account</Text>
      </Menu.Item>
      <Menu.Item key="logout">
        <Text>Log out</Text>
      </Menu.Item>
    </Menu>
  );

  return (
    <Dropdown.Button
      overlay={menu}
      trigger={["click"]}
      icon={<UserOutlined />}
    />
  );
};

// deprecated, using @aws-amplify/ui-react instead to handle login
export const gotoCognitoLogin = () => {
  const cognitoDomain = config.cognitoClientDomain;
  const cognitoClientId = config.cognitoClientId;
  const appUrl = config.appUrl;

  const loginUrl = `${cognitoDomain}/login?client_id=${cognitoClientId}&redirect_uri=${appUrl}&response_type=code`;

  location.assign(loginUrl);
};

// deprecated, using @aws-amplify/ui-react instead to handle login
export const gotoCognitoSignup = () => {
  const cognitoDomain = config.cognitoClientDomain;
  const cognitoClientId = config.cognitoClientId;
  const appUrl = config.appUrl;

  const loginUrl = `${cognitoDomain}/signup?client_id=${cognitoClientId}&redirect_uri=${appUrl}&response_type=code`;

  location.assign(loginUrl);
};

const LoginButtons: React.FC = () => {
  const history = useHistory();

  const handleLoginClicked = () => {
    history.push(LOGIN_PATH);
  };

  const handleSignupClicked = () => {
    history.push(SIGNUP_PATH);
  };

  const newUser = !hasUserSession();

  return (
    <ButtonsContainer>
      <LoginButton
        type={newUser ? "primary" : "ghost"}
        onClick={handleSignupClicked}
        key="signup"
      >
        Start free trial
      </LoginButton>
      <LoginButton
        type={newUser ? "ghost" : "primary"}
        onClick={handleLoginClicked}
        key="login"
      >
        Log in
      </LoginButton>
    </ButtonsContainer>
  );
};

const NavbarContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const LogoContainer = styled.div`
  flex-grow: 1;
`;

export const Navbar: React.FC = () => {
  const userAuthState = useAppSelector((state) => state.userAuth);
  const userLoggedIn = userAuthState.status !== "NULL";

  const [inUserSubPage, setInUserSubPage] = useState(false);

  useLocationChanged((location) => {
    setInUserSubPage(location.pathname.includes("user"));
  });

  return (
    <Header>
      <NavbarContainer>
        <LogoContainer>
          <Link to={ROOT_PATH}>
            <img src={logo} alt="Social Watcher logo" />
          </Link>
        </LogoContainer>
        <TopMenu inUserSubPage={inUserSubPage} userLoggedIn={userLoggedIn} />
        {userLoggedIn ? (
          <UserProfile userDetails={userAuthState} />
        ) : (
          <LoginButtons />
        )}
      </NavbarContainer>
    </Header>
  );
};
