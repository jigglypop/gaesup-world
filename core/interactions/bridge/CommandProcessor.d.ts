import { InteractionCommand } from './types';
export type CommandHandler<TCommand extends InteractionCommand> = (command: TCommand) => void | Promise<void>;
export declare class CommandProcessor<TCommand extends InteractionCommand> {
    private handlers;
    private commandHistory;
    private readonly maxHistorySize;
    constructor(maxHistorySize?: number);
    register(type: string, handler: CommandHandler<TCommand>): void;
    execute(command: TCommand): Promise<void>;
    private addToHistory;
    getHistory(): TCommand[];
    clearHistory(): void;
    dispose(): void;
}
