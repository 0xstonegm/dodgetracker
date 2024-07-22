import * as winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { Console } from "winston/lib/winston/transports";

const projectRoot = "/home/isak102/Code/dodgetracker";

const logger = winston.createLogger({
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
    new Console(),
    new DailyRotateFile({
      filename: `${projectRoot}/src/websockets/.logs/%DATE%_websocket.log`,
      datePattern: "DD-MM-YYYY",
      createSymlink: true,
      symlinkName: "CURRENT.log",
      maxSize: "20m",
      maxFiles: "7d",
    }),
  ],
});

export default logger;
