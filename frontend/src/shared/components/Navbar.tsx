import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { Button, Layout, Menu, Dropdown, Typography } from "antd";
import logo from "url:../../../assets/logo-navbar.jpg";
import styled from "styled-components";
import { Auth } from "aws-amplify";
import { useAppSelector } from "../store";
import { UserState } from "../reducers/userState";
import { MenuClickEventHandler } from "rc-menu/lib/interface";
import { useLocationPathChanged } from "../lib/react";
import { getConfig } from "../lib/config";
import _ from "lodash";
import { UserOutlined } from "@ant-design/icons";

const { Header } = Layout;
const { Text } = Typography;

const config = getConfig();

const navigationConfig: Record<string, string> = {
  product: "/",
  pricing: "/pricing",
  about: "/about",
  guides: "/user/guides",
  dashboard: "/user/dashboard",
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

  useLocationPathChanged((newPath: string) => {
    const currentKey = _.findKey(navigationConfig, (path) => newPath == path);
    setState({ selectedKeys: currentKey ? [currentKey] : [] });
  });

  const handleClick: MenuClickEventHandler = ({ key }) => {
    setState({ selectedKeys: [key.toString()] });
    history.push(navigationConfig[key.toString()]);
  };

  const buttons: JSX.Element[] = [];
  if (inUserSubPage) {
    buttons.push(
      <Menu.Item key="dashboard">Dashboard</Menu.Item>,
      <Menu.Item key="guides">Guides</Menu.Item>
    );
  } else {
    buttons.push(
      <Menu.Item key="product">Product</Menu.Item>,
      <Menu.Item key="pricing">Pricing</Menu.Item>,
      <Menu.Item key="about">About</Menu.Item>
    );
    if (userLoggedIn) {
      buttons.push(<Menu.Item key="dashboard">Dashboard</Menu.Item>);
    }
  }

  return (
    <Menu
      mode="horizontal"
      onClick={handleClick}
      selectedKeys={state.selectedKeys}
    >
      {buttons}
    </Menu>
  );
};

const ButtonsContainer = styled.div``;

const LoginButton = styled(Button)`
  color: white;
  :hover {
    color: gray;
  }
`;

type UserProfileProps = {
  user: Required<UserState>["details"];
};

const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  const history = useHistory();

  const handleItemClicked: MenuClickEventHandler = async ({ key }) => {
    console.log(key);
    switch (key.toString()) {
      case "account": {
        history.push("/user/account");
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
      <Menu.Item style={{ pointerEvents: "none" }}>
        {/*makes it not clickable/selectable*/}
        <Text>{user.email}</Text>
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

const LoginButtons: React.FC = () => {
  const handleLoginClicked = () => {
    const cognitoDomain = config.cognitoClientDomain;
    const cognitoClientId = config.cognitoClientId;
    const appUrl = config.appUrl;

    const loginUrl = `${cognitoDomain}/login?client_id=${cognitoClientId}&redirect_uri=${appUrl}&response_type=code`;

    location.assign(loginUrl);
  };

  return (
    <ButtonsContainer>
      <LoginButton type="text" onClick={() => handleLoginClicked()} key="login">
        Log in
      </LoginButton>
      ,
      <LoginButton
        type="primary"
        onClick={() => console.log("sign up")}
        key="signup"
      >
        Start free trial
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
  const user = useAppSelector((state) => state.user.details);

  const [inUserSubPage, setInUserSubPage] = useState(false);

  useLocationPathChanged((newPath: string) => {
    setInUserSubPage(newPath.includes("user"));
  });

  return (
    <Header>
      <NavbarContainer>
        <LogoContainer>
          <Link to="/">
            <img src={logo} alt="Social Watcher logo" />
          </Link>
        </LogoContainer>
        <TopMenu
          inUserSubPage={inUserSubPage}
          userLoggedIn={user != undefined}
        />
        {user ? <UserProfile user={user} /> : <LoginButtons />}
      </NavbarContainer>
    </Header>
  );
};
