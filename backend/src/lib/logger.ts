import pino from "pino";
import { JsonObjectEncodable } from "@diogovasconcelos/lib";

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

  info(message: string, context?: JsonObjectEncodable) {
    pinoLogger.info(context ?? {}, message);
  },

  fatal(message: string, context?: JsonObjectEncodable) {
    pinoLogger.fatal(context ?? {}, message);
  },

  warn(message: string, context?: JsonObjectEncodable) {
    pinoLogger.warn(context ?? {}, message);
  },

  error(message: string, context?: JsonObjectEncodable) {
    pinoLogger.error(context ?? {}, message);
  },

  debug(message: string, context?: JsonObjectEncodable) {
    pinoLogger.debug(context ?? {}, message);
  },

  trace(message: string, context?: JsonObjectEncodable) {
    pinoLogger.trace(context ?? {}, message);
  },
};

export const getLogger = (): Logger => {
  return logger;
};

export default logger;

export const getCurrentLogger = () => pinoLogger;
