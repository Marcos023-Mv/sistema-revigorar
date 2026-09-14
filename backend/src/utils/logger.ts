import pino from 'pino';
import { env } from '../config/env';

const logger = pino({
  level: env.isDev ? 'debug' : 'info',
  transport: env.isDev
    ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss' } }
    : undefined,
});

export default logger;
