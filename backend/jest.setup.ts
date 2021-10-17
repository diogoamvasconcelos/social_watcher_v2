if (process.env.LOG_LEVEL === undefined) {
  process.env.LOG_LEVEL = "silent";
}

// `fail` is temporarly broken (hopefully) on Jest: https://github.com/facebook/jest/issues/11698
function fail(reason = "fail was called in a test.") {
  throw new Error(reason);
}

global.fail = fail;
