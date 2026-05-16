export type LogLevel = 'log' | 'warn' | 'error' | 'info';
export type LogValue = object | string | number | boolean | bigint | symbol | null | undefined;
declare class Logger {
    private static instance;
    private enabled;
    private level;
    private constructor();
    static getInstance(): Logger;
    enable(): void;
    disable(): void;
    setLevel(level: LogLevel): void;
    private shouldLog;
    log(message: string, ...args: LogValue[]): void;
    info(message: string, ...args: LogValue[]): void;
    warn(message: string, ...args: LogValue[]): void;
    error(message: string, ...args: LogValue[]): void;
}
export declare const logger: Logger;
export {};
