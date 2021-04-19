# Bootstrap (npm, parcel, react, typescript)

- refs:
  - https://dev.to/grant_bartlett/getting-started-with-react-typescript-and-parcel-1ocb
  - https://adrianhall.github.io/javascript/react/2020/03/29/parcel-typescript-react/
  - https://pagepro.co/blog/building-app-with-react-typescript-and-parcel/
  - https://github.com/diogoamvasconcelos/kack-overklow

## Webpack vs Parcel

- https://blog.jakoblind.no/parcel-webpack/
  - "when I start a new project I start with parcel because it’s so quick to get up and running. If/when it grows large, and I need a more advanced configuration, I move over to webpack." Sounds good to me!

## Initial packages to install

```
yarn add react react-dom react-router-dom

yarn add parcel-bundler typescript @types/react @types/react-dom @types/react-router-dom --dev

```

## Install Other stuff

```
yarn add eslint eslint-config-prettier eslint-plugin-jest prettier @typescript-eslint/eslint-plugin @typescript-eslint/parser --dev
yarn add jest jest-extended @types/jest --dev
yarn add loadsh uuid fp-ts io-ts axios deepmerge monocle-ts newtype-ts
yarn add ts-node type-fest @types/lodash @types/uuid --dev
```

## Install ant design library

https://ant.design/docs/react/use-in-typescript

```
yarn add antd
```

The out of the box way to work with `antd` is not the easiest for imports.

- `@import "antd/dist/antd.css";` in App.tsx to load the css
- `import Layout from "antd/es/layout"; const { Footer } = Layout;` to import a Footer

Use instead the `babel-plugin-import` to make it easier: https://github.com/ant-design/babel-plugin-import

```
yarn add babel-plugin-import --dev
```

and setup the .babelrc following: https://github.com/ant-design/parcel-antd

## Add async/await support

- it doesnt work out of the box: https://github.com/parcel-bundler/parcel/issues/2442
- use the `https://babeljs.io/docs/en/babel-plugin-transform-runtime`

```
yarn add @babel/plugin-transform-runtime --dev
yarn add @babel/runtime
```

- add a `babel.rc`

## Add redux

- nice tutorials: https://www.youtube.com/watch?v=OxIDLw0M-m0&list=PL4cUxeGkcC9ij8CfkAY2RAGb-tmkNwQHG
- and: https://redux.js.org/recipes/usage-with-typescript/

```
yarn add redux react-redux
yarn add @types/react-redux --ddev
```

- redux-thunk for Async actions / http requests
- https://github.com/reduxjs/redux-thunk and https://redux.js.org/recipes/usage-with-typescript/
- quick tut: https://www.youtube.com/watch?v=apg98RIJfJo&list=PL4cUxeGkcC9iWstfXntcj8f-dFZ4UtlN3&index=14

```
yarn add redux-thunk
```

## Mock server

- Local `nodejs` with `express`
- https://github.com/TypeStrong/ts-node
- https://github.com/expressjs/express

- guide: https://developer.okta.com/blog/2018/11/15/node-express-typescript

```
yarn add express @types/node @types/express --dev
```

- add express `cors` middleware to enable all cors requests

```
yarn add cors --dev
```

## Add index.html

- add index.html, index.tsx, App.css and App.tsx
