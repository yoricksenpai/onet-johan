import winston from 'winston';
import fs from 'fs';
import moment from 'moment';
import isEmpty from 'lodash/isEmpty';
import { config } from './convict-config';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';

const { format } = winston;
const { combine, timestamp, printf, metadata, colorize, errors } = format;

const LOGS_DIR = './logs';
const MAX_FILE_SIZE = 5242880; // 5MB
const MAX_FILES = 5;

// Ensure logs directory exists
if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR);
}

const customFormat = (): winston.Logform.Format => {
    return combine(
        errors({ stack: true }),
        metadata({}),
        timestamp(),
        colorize({ all: true }),
        printf(({ level, message, timestamp: time, metadata: meta }) => {
            let out = `[${moment(time).format('DD/MM/YYYY:HH:mm:ss ZZ')}] [${level}] ${message}\n`;

            if (meta?.error) {
                out += `\n${meta.methodPath || ''}\n\n`;
                out += `\n${meta.stack || ''}\n\n`;
                out += meta.query ? `${meta.query}\n` : '\n';
            } else if (!isEmpty(meta)) {
                out += `\n${JSON.stringify(meta, null, 2)}\n`;
            }

            return out;
        })
    );
};

const createFileTransport = (options: winston.transports.FileTransportOptions): winston.transport => {
    return new winston.transports.File({
        maxsize: MAX_FILE_SIZE,
        maxFiles: MAX_FILES,
        handleExceptions: true,
        format: customFormat(),
        ...options,
    });
};

const loggerObj: winston.Logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: {},
    exitOnError: false,
    handleExceptions: true,
    transports: [
        createFileTransport({
            level: 'error',
            filename: `${LOGS_DIR}/error.log`,
        }),
        createFileTransport({
            filename: `${LOGS_DIR}/combined.log`,
        }),
    ],
});

const appName = `nest-api-onet-${config.get('env')}`;

// Add console transport in non-test environment
if (config.get('env') !== 'test') {
    loggerObj.add(
        new winston.transports.Console({
            level: 'silly',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.ms(),
                nestWinstonModuleUtilities.format.nestLike(appName, {
                    colors: true,
                    prettyPrint: true,
                }),
            ),
            handleExceptions: true,
        })
    );
}

export const winstonLoggerConfig = loggerObj;

export const morganOption = {
    stream: {
        write: (message: string) => {
            if (config.get('env') === 'test') return;
            loggerObj.info(message.trim());
        },
    },
};