import React, { useState } from "react";
import Sider from "antd/lib/layout/Sider";
import Layout from "antd/lib/layout";
import Menu from "antd/lib/menu";
import TagsFilled from "@ant-design/icons/lib/icons/TagsFilled";
import FileSearchOutlined from "@ant-design/icons/lib/icons/FileSearchOutlined";
import { MenuClickEventHandler } from "rc-menu/lib/interface";
import { Redirect, Route, Switch, useHistory } from "react-router-dom";
import { KeywordsPage } from "./keywords/KeywordsPage";
import { ArchivesPage } from "./archives/ArchivesPage";
import { useLocationChanged } from "../../shared/lib/react";
import _findKey from "lodash/findKey";
import { mapRecord } from "../../shared/lib/collections";
import { SearchObjectConfigPage } from "./searchObjectConfig/SearchObjectConfigPage";
import {
  DASHBOARD_PATH,
  KEYWORDS_PATH,
  ARCHIVES_PATH,
} from "../../shared/data/paths";
import { withLoggedUser } from "@src/shared/components/Auth";
import styled from "styled-components";
import { colors } from "@src/shared/style/colors";

// ref: https://preview.pro.ant.design/dashboard/analysis/

export const navigationConfig: Record<
  string,
  { path: string; label: string; icon: React.ReactNode }
> = {
  keywords: {
    path: KEYWORDS_PATH,
    label: "Keywords",
    icon: <TagsFilled />,
  },
  search: {
    path: ARCHIVES_PATH,
    label: "Archives",
    icon: <FileSearchOutlined />,
  },
};

// +++++++++++
// + SIDEBAR +
// +++++++++++

const StyledSides = styled(Sider)`
  background-color: ${colors.neutral.light2};
  /*span 100% of the viewport*/
  min-height: 100vh;

  & .ant-menu {
    background-color: transparent;
    color: ${colors.neutral.dark3};

    & .ant-menu-item-selected {
      background-color: ${colors.primary.light2};
      color: ${colors.primary.medium2};
    }
  }

  & .ant-layout-sider-trigger {
    background-color: ${colors.neutral.dark1};
  }
`;

const SideBar: React.FC = () => {
  const history = useHistory();

  const [collapsed, setCollapsed] = useState(false);
  const [selectedKeys, setselectedKeys] = useState<string[]>([]);

  const onCollapse = (collapsed: boolean) => {
    setCollapsed(collapsed);
  };

  const handleClick: MenuClickEventHandler = ({ key }) => {
    history.push(navigationConfig[key.toString()].path);
  };

  useLocationChanged((location) => {
    const currentKey = _findKey(navigationConfig, (item) =>
      location.pathname.includes(item.path)
    );
    setselectedKeys(currentKey ? [currentKey] : []);
  });

  return (
    <StyledSides collapsible collapsed={collapsed} onCollapse={onCollapse}>
      <Menu mode="inline" onClick={handleClick} selectedKeys={selectedKeys}>
        {mapRecord(navigationConfig, (key, value) => (
          <Menu.Item key={key} icon={value.icon}>
            {value.label}
          </Menu.Item>
        ))}
      </Menu>
    </StyledSides>
  );
};

// ++++++++
// + PAGE +
// ++++++++

const MainContainer = styled.div`
  & .ant-layout {
    background: ${colors.neutral.light3};
  }
`;

const ContentContainer = styled.div`
  /* center content */
  flex-grow: 1;
`;

const Page: React.FC = () => {
  return (
    <MainContainer>
      <Layout>
        <SideBar />
        <ContentContainer>
          <Switch>
            <Route
              path={DASHBOARD_PATH}
              exact
              render={() => <Redirect to={KEYWORDS_PATH} />}
            ></Route>
            <Route
              path={`${KEYWORDS_PATH}/:index`}
              component={SearchObjectConfigPage}
            />
            <Route path={KEYWORDS_PATH} component={KeywordsPage} />
            <Route path={ARCHIVES_PATH} component={ArchivesPage} />
          </Switch>
        </ContentContainer>
      </Layout>
    </MainContainer>
  );
};

export const DashboardPage = withLoggedUser(Page);
