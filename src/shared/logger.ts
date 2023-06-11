import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

const { combine, timestamp, label, printf } = format;

const myFormat = printf(({ level, message, label, timestamp }) => {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  return `${date.toDateString()} ${hours}:${minute}:${second} [${label}] ${level}: ${message}`;
});

const logger = createLogger({
  level: 'info',
  format: combine(
    label({ label: 'University project' }),
    timestamp(),
    myFormat
  ),
  transports: [
    new transports.Console(),
    new DailyRotateFile({
      filename: path.join(
        process.cwd(),
        'logs',
        'winston',
        'successes',
        'uni-%DATE%-success.log'
      ),
      datePattern: 'DD MMM, YYYY HH',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
    }),
  ],
});

const errorLogger = createLogger({
  level: 'error',
  format: combine(
    label({ label: 'My university project' }),
    timestamp(),
    myFormat
  ),
  transports: [
    new transports.Console(),
    new DailyRotateFile({
      filename: path.join(
        process.cwd(),
        'logs',
        'winston',
        'errors',
        'uni-%DATE%-error.log'
      ),
      datePattern: 'DD MMM, YYYY HH',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
    }),
  ],
});

export { logger, errorLogger };
