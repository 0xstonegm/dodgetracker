"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston = __importStar(require("winston"));
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const isLambda = !!process.env.AWS_EXECUTION_ENV;
const path = require("path");
let projectRoot = "/home/isak102/Code/dodgetracker";
const logger = isLambda
    ? console
    : winston.createLogger({
        format: winston.format.combine(winston.format.timestamp({
            format: "YYYY-MM-DD HH:mm:ss.SSS",
        }), winston.format.printf((info) => `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}`)),
        transports: [
            new winston_daily_rotate_file_1.default({
                filename: `${projectRoot}/.logs/%DATE%_dodgetracker.log`,
                datePattern: "DD-MM-YYYY",
                createSymlink: true,
                symlinkName: "CURRENT.log",
                maxSize: "20m",
                maxFiles: "7d",
            }),
        ],
    });
exports.default = logger;
