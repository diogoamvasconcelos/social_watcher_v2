import pino from "pino";

const newPinoLogger = () => {
  return pino({
    level: process.env.LOG_LEVEL ?? "info",
    prettyPrint: false,
  });
};

let pinoLogger = newPinoLogger();

export type Logger = {
  addToContext: (context: LogContext) => void;
  getContext: () => LogContext;
  resetContext: () => void;
  info: LogFn;
  warn: LogFn;
  fatal: LogFn;
  error: LogFn;
  debug: LogFn;
  trace: LogFn;
};

type LogContext = pino.Bindings;
type LogFn = (message: string, context?: LogContext) => void;

const logger: Logger = {
  addToContext: (context: LogContext) => {
    pinoLogger = pinoLogger.child(context);
  },

  getContext: () => pinoLogger.bindings(),

  resetContext: () => {
    pinoLogger = newPinoLogger();
  },

  info: (message, context) => pinoLogger.info(context ?? {}, message),
  fatal: (message, context) => pinoLogger.fatal(context ?? {}, message),
  warn: (message, context) => pinoLogger.warn(context ?? {}, message),
  error: (message, context) => pinoLogger.error(context ?? {}, message),
  debug: (message, context) => pinoLogger.debug(context ?? {}, message),
  trace: (message, context) => pinoLogger.trace(context ?? {}, message),
};

export const getLogger = (): Logger => {
  return logger;
};

export default logger;
