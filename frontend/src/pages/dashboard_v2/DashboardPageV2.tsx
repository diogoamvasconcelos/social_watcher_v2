import React, { useState } from "react";
import Sider from "antd/lib/layout/Sider";
import Layout from "antd/lib/layout";
import Menu from "antd/lib/menu";
import TagsFilled from "@ant-design/icons/lib/icons/TagsFilled";
import FileSearchOutlined from "@ant-design/icons/lib/icons/FileSearchOutlined";
import { MenuClickEventHandler } from "rc-menu/lib/interface";
import { Route, Switch, useHistory } from "react-router-dom";
import { KeywordsPage } from "./keywords/KeywordsPage";
import { SearchPage } from "./search/SearchPage";

// ref: https://preview.pro.ant.design/dashboard/analysis/

const navigationConfig: Record<string, string> = {
  keywords: "/user/dashboardv2/keywords",
  search: "/user/dashboardv2/search",
};

export const DashboardPageV2: React.FC = () => {
  const history = useHistory();

  const [siderCollapsed, setSiderCollapsed] = useState(false);
  const [selectedKeys, setselectedKeys] = useState<string[]>([]);

  const onSiderCollapse = (collapsed: boolean) => {
    setSiderCollapsed(collapsed);
  };
  const handleClick: MenuClickEventHandler = ({ key }) => {
    setselectedKeys([key.toString()]);
    history.push(navigationConfig[key.toString()]);
  };

  return (
    <Layout>
      <Sider
        collapsible
        collapsed={siderCollapsed}
        onCollapse={onSiderCollapse}
        style={{ minHeight: "100vh" }}
      >
        <Menu mode="inline" onClick={handleClick} selectedKeys={selectedKeys}>
          <Menu.Item key="keywords" icon={<TagsFilled />}>
            Keywords
          </Menu.Item>
          <Menu.Item key="search" icon={<FileSearchOutlined />}>
            Search
          </Menu.Item>
        </Menu>
      </Sider>
      <Switch>
        <Route path="/" exact>
          <p>Work in Progress</p>
        </Route>
        <Route path="/user/dashboardv2/keywords" component={KeywordsPage} />
        <Route path="/user/dashboardv2/search" component={SearchPage} />
      </Switch>
    </Layout>
  );
};
