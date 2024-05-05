import * as winston from "winston";
import { format } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

// Define a type that encompasses both console and winston's logger methods for TypeScript
// For JavaScript, you can remove this type definition
type LoggerType = typeof console & winston.Logger;

const isLambda: boolean = !!process.env.AWS_EXECUTION_ENV;

const path = require("path");
let projectRoot = path.join(__dirname, "..", "..", "..").toString();

const logger: LoggerType = isLambda
  ? (console as LoggerType)
  : (winston.createLogger({
      format: format.combine(
        format.timestamp({
          format: "YYYY-MM-DD HH:mm:ss.SSS",
        }),
        format.printf(
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
