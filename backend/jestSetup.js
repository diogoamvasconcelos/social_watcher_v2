if (
  process.env.LOG_LEVEL === undefined &&
  process.env.USE_LOGGER === undefined
) {
  process.env.LOG_LEVEL = "silent";
}
