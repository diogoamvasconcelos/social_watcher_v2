import { getLogger } from "./logger";

describe("lib/logger", () => {
  const logger = getLogger();

  const expectedContext = { one: 1 };

  const context1 = { one: expectedContext.one };
  const context2 = { two: 2 };

  beforeEach(() => {
    logger.resetContext();

    logger.addToContext(context1);
  });

  describe("it adds to context correctly when we call...", () => {
    test(".info()", () => {
      logger.info("", context2);
      expect(logger.getContext()).toEqual(expectedContext);
    });

    test(".warn()", () => {
      logger.warn("", context2);
      expect(logger.getContext()).toEqual(expectedContext);
    });

    test(".fatal()", () => {
      logger.fatal("", context2);
      expect(logger.getContext()).toEqual(expectedContext);
    });

    test(".error()", () => {
      logger.error("", context2);
      expect(logger.getContext()).toEqual(expectedContext);
    });

    test(".debug()", () => {
      logger.debug("", context2);
      expect(logger.getContext()).toEqual(expectedContext);
    });

    test(".trace()", () => {
      logger.trace("", context2);
      expect(logger.getContext()).toEqual(expectedContext);
    });
  });
});
