import { Logger } from "@src/lib/logger";

export const loggerMock: Logger = {
  addToContext: jest.fn(),
  getContext: jest.fn(),
  resetContext: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  fatal: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  trace: jest.fn(),
};
