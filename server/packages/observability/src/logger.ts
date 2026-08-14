import type { LoggerService } from '@nestjs/common';
import pino, { type Logger, type LoggerOptions } from 'pino';
import { getCorrelationId } from './correlation';
import { normalizeError } from './errors';
import { redact } from './redaction';

export interface StructuredLoggerOptions {
  service: string;
  environment: string;
  level: string;
  destination?: pino.DestinationStream;
}

export class StructuredLogger implements LoggerService {
  private readonly logger: Logger;

  constructor(options: StructuredLoggerOptions) {
    const loggerOptions: LoggerOptions = {
      level: options.level,
      base: { service: options.service, environment: options.environment },
      timestamp: pino.stdTimeFunctions.isoTime,
      ...(options.environment !== 'production' && !options.destination
        ? {
            transport: {
              target: 'pino-pretty',
              options: { colorize: true, singleLine: true },
            },
          }
        : {}),
    };
    this.logger = options.destination
      ? pino(loggerOptions, options.destination)
      : pino(loggerOptions);
  }

  log(message: unknown, ...optionalParams: unknown[]): void {
    this.write('info', message, optionalParams);
  }

  fatal(message: unknown, ...optionalParams: unknown[]): void {
    this.write('fatal', message, optionalParams);
  }

  error(message: unknown, ...optionalParams: unknown[]): void {
    const error = message instanceof Error ? normalizeError(message) : {};
    this.write('error', message, optionalParams, error);
  }

  warn(message: unknown, ...optionalParams: unknown[]): void {
    this.write('warn', message, optionalParams);
  }

  debug(message: unknown, ...optionalParams: unknown[]): void {
    this.write('debug', message, optionalParams);
  }

  verbose(message: unknown, ...optionalParams: unknown[]): void {
    this.write('trace', message, optionalParams);
  }

  private write(
    level: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace',
    message: unknown,
    optionalParams: unknown[],
    fields: Record<string, unknown> = {},
  ): void {
    const context =
      typeof optionalParams.at(-1) === 'string'
        ? optionalParams.at(-1)
        : undefined;
    const metadata = context ? optionalParams.slice(0, -1) : optionalParams;
    const data = redact({
      ...fields,
      ...(getCorrelationId() ? { correlationId: getCorrelationId() } : {}),
      ...(context ? { context } : {}),
      ...(metadata.length > 0 ? { metadata } : {}),
      ...(typeof message === 'object' && message !== null
        ? { data: message }
        : {}),
    });
    const text =
      message instanceof Error
        ? message.message
        : typeof message === 'string'
          ? message
          : 'Structured log event';
    this.logger[level](data, text);
  }
}
