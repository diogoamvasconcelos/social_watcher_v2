## Refs

- https://medium.com/@madura/reduce-aws-amplify-bundle-size-inside-your-app-feac2e10cd22

## analyze

```
yarn analyze
```

## Remove all big imports

before:

```
import { Layout, Typography } from "antd";

import _ from "lodash";

import { UserOutlined } from "@ant-design/icons";

```

after:

```
import Layout from "antd/lib/layout";
import Typography from "antd/lib/typography";

import _findKey from "lodash/findKey";

import UserOutlined from "@ant-design/icons/lib/icons/UserOutlined";
```
