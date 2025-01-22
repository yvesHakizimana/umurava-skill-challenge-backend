import {existsSync, mkdirSync} from 'fs'
import { join } from 'path'
import winston from "winston";
import winstonDaily from 'winston-daily-rotate-file'
import {LOG_DIR} from "@config";

const logDir = join(__dirname, LOG_DIR || 'logs')

/*
* existsSync:: Checking for the presence of the fileSystem.
* mkdirSync :: Creating the directory or the file.
* */
if(!existsSync(logDir)) {
    mkdirSync(logDir)
}

/*
* Creates the log format which will be used for the logs.
* */
const logFormat = winston.format.printf(({ timestamp, level, message}) => `${timestamp} ${level}: ${message}`)

/*
* Log Level
* error: 0, warn: 1, info: 2, http: 3, verbose: 4, debug: 5, silly: 6
* The below code uses the format we specified above for saving the files, and they will be zipped after 30 days.
* */

const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
        logFormat,
    ),
    transports: [
        new winstonDaily({
            level: 'debug',
            datePattern: 'YYYY-MM-DD',
            dirname: logDir + '/debug',
            filename: `%DATE%.log`,
            maxFiles: 30, // 30 Days saved.
            json: false,
            zippedArchive: true,
        })
    ]
})

/*
* This transport allows us to display the logs in the terminal.
* */
logger.add(new winston.transports.Console({
    format: winston.format.combine(winston.format.splat(), winston.format.colorize())
}))

/*
* This is integrating with the other logging systems like morga.
* */
const stream = {
    write: (message: string) => {
        logger.info(message.substring(0, message.indexOf('\n')));
    }
}

export {logger, stream}