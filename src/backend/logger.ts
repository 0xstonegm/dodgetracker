import * as winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

// Define a type that encompasses both console and winston's logger methods for TypeScript
// For JavaScript, you can remove this type definition
type LoggerType = typeof console & winston.Logger;

const isLambda = !!process.env.AWS_EXECUTION_ENV;
const projectRoot = "/home/isak102/Code/dodgetracker";

const logger: LoggerType = isLambda
  ? (console as LoggerType)
  : (winston.createLogger({
      format: winston.format.combine(
        winston.format.timestamp({
          format: "YYYY-MM-DD HH:mm:ss.SSS",
        }),
        winston.format.printf(
          (info) =>
            `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}`,
        ),
      ),
      transports: [
        new DailyRotateFile({
          filename: `${projectRoot}/.logs/%DATE%_dodgetracker.log`,
          datePattern: "DD-MM-YYYY",
          createSymlink: true,
          symlinkName: "CURRENT.log",
          maxSize: "20m",
          maxFiles: "7d",
        }),
      ],
    }) as LoggerType);

export default logger;
