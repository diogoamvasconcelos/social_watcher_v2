import { JsonObjectEncodable } from "@diogovasconcelos/lib/models/jsonEncodable";
import pino from "pino";

const options = {
  level: process.env.LOG_LEVEL ?? "info",
};

const newPinoLogger = () => {
  return pino(options);
};

let pinoLogger = newPinoLogger();

const getPinoLoggerBindings = (): JsonObjectEncodable => {
  return pinoLogger.bindings();
};

type LogFn = (message: string, context?: JsonObjectEncodable) => void;

export type Logger = {
  addToContext: (context: JsonObjectEncodable) => void;
  getContext: () => JsonObjectEncodable;
  createContext: (context: JsonObjectEncodable) => void;
  resetContext: () => void;
  info: LogFn;
  warn: LogFn;
  fatal: LogFn;
  error: LogFn;
  debug: LogFn;
  trace: LogFn;
};

const logger: Logger = {
  addToContext(context: JsonObjectEncodable) {
    pinoLogger = pinoLogger.child(context);
  },

  getContext() {
    return getPinoLoggerBindings();
  },

  createContext(context: JsonObjectEncodable) {
    this.addToContext(context);
  },

  resetContext(context?: JsonObjectEncodable) {
    pinoLogger = newPinoLogger();
    if (context) {
      this.addToContext(context);
    }
  },

  info(message, context) {
    pinoLogger.info(context ?? {}, message);
  },

  fatal(message, context) {
    pinoLogger.fatal(context ?? {}, message);
  },

  warn(message, context) {
    pinoLogger.warn(context ?? {}, message);
  },

  error(message, context) {
    pinoLogger.error(context ?? {}, message);
  },

  debug(message, context) {
    pinoLogger.debug(context ?? {}, message);
  },

  trace(message, context) {
    pinoLogger.trace(context ?? {}, message);
  },
};

export const getLogger = (): Logger => {
  return logger;
};

export default logger;

export const getCurrentLogger = () => pinoLogger;
