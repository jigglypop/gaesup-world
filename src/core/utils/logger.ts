const isProduction = process.env['NODE_ENV'] === 'production';

type LogLevel = 'log' | 'warn' | 'error' | 'info';

class Logger {
  private static instance: Logger;
  private enabled: boolean = !isProduction;
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

  private shouldLog(level: LogLevel): boolean {
    if (!this.enabled) return false;
    const levels: Record<LogLevel, number> = {
      error: 0,
      warn: 1,
      info: 2,
      log: 3,
    };
    return levels[level] <= levels[this.level];
  }

  public log(message: string, ...args: unknown[]): void {
    if (this.shouldLog('log')) {
      console.log(`[LOG] ${message}`, ...args);
    }
  }

  public info(message: string, ...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }

  public warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  public error(message: string, ...args: unknown[]): void {
    if (this.shouldLog('error')) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  }
}

export const logger = Logger.getInstance(); 