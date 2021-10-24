## How to run tests

```
yarn with-local-stack 'jest --testMatch "<rootDir>scripts/ops/patches/<patch_file_name>.test.ts"'
```

> Remember to comment the `void main()` from the actual `<patch_file_name>.ts`

## How to run the patch

```
scripts/with_env.js 'yarn ts-node -r tsconfig-paths/register scripts/ops/patches/<patch_file_name>' --env dev
```

> Remember to unccomment the `void main()` from the `<patch_file_name>.ts`, run, and then comment it back again
