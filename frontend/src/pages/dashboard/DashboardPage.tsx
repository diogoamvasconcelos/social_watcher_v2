import React, { useState } from "react";
import Sider from "antd/lib/layout/Sider";
import Layout from "antd/lib/layout";
import Menu from "antd/lib/menu";
import TagsFilled from "@ant-design/icons/lib/icons/TagsFilled";
import FileSearchOutlined from "@ant-design/icons/lib/icons/FileSearchOutlined";
import { MenuClickEventHandler } from "rc-menu/lib/interface";
import { Redirect, Route, Switch, useHistory } from "react-router-dom";
import { KeywordsPage } from "./keywords/KeywordsPage";
import { SearchPage } from "./search/SearchPage";
import { useLocationChanged } from "../../shared/lib/react";
import _findKey from "lodash/findKey";
import { mapRecord } from "../../shared/lib/collections";
import { SearchObjectConfigPage } from "./searchObjectConfig/SearchObjectConfigPage";
import {
  DASHBOARD_PATH,
  KEYWORDS_PATH,
  SEARCH_PATH,
} from "../../shared/data/paths";
import { withLoggedUser } from "@src/shared/components/Auth";

// ref: https://preview.pro.ant.design/dashboard/analysis/

// +++++++++++
// + SIDEBAR +
// +++++++++++

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
    path: SEARCH_PATH,
    label: "Search",
    icon: <FileSearchOutlined />,
  },
};

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
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      style={{ minHeight: "100vh" /*span 100% of the viewport*/ }}
    >
      <Menu mode="inline" onClick={handleClick} selectedKeys={selectedKeys}>
        {mapRecord(navigationConfig, (key, value) => (
          <Menu.Item key={key} icon={value.icon}>
            {value.label}
          </Menu.Item>
        ))}
      </Menu>
    </Sider>
  );
};

// ++++++++
// + PAGE +
// ++++++++

const Page: React.FC = () => {
  return (
    <Layout>
      <SideBar />
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
        <Route path={SEARCH_PATH} component={SearchPage} />
      </Switch>
    </Layout>
  );
};

export const DashboardPage = withLoggedUser(Page);
