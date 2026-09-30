import { readNodeEnv } from './env';

const nodeEnv = readNodeEnv();

export type LogLevel = 'log' | 'warn' | 'error' | 'info';
export type LogValue = object | string | number | boolean | bigint | symbol | null | undefined;

const LEVEL_RANK: Readonly<Record<LogLevel, number>> = {
  error: 0,
  warn: 1,
  info: 2,
  log: 3,
};

class Logger {
  private static instance: Logger;
  private enabled: boolean = nodeEnv !== 'production' && nodeEnv !== 'test';
  private level: LogLevel = 'info';

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public enable(): void {
    this.enabled = true;
  }

  public disable(): void {
    this.enabled = false;
  }

  public setLevel(level: LogLevel): void {
    this.level = level;
  }

  /** Lets hot paths skip building messages that would be discarded. */
  public isEnabled(level: LogLevel): boolean {
    return this.enabled && LEVEL_RANK[level] <= LEVEL_RANK[this.level];
  }

  private shouldLog(level: LogLevel): boolean {
    return this.isEnabled(level);
  }

  public log(message: string, ...args: LogValue[]): void {
    if (this.shouldLog('log')) {
      console.log(`[LOG] ${message}`, ...args);
    }
  }

  public info(message: string, ...args: LogValue[]): void {
    if (this.shouldLog('info')) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }

  public warn(message: string, ...args: LogValue[]): void {
    if (this.shouldLog('warn')) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  public error(message: string, ...args: LogValue[]): void {
    if (this.shouldLog('error')) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  }
}

export const logger = Logger.getInstance(); 

/** Unconditional error output for the default error sink; production errors must stay visible even with logging off. */
export function writeErrorReport(message: string, error: Error): void {
  console.error(message, error);
}
