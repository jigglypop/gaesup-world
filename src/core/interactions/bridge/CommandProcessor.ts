import { InteractionCommand } from './types';

export type CommandHandler<TCommand extends InteractionCommand> = 
  (command: TCommand) => void | Promise<void>;

export class CommandProcessor<TCommand extends InteractionCommand> {
  private handlers: Map<string, CommandHandler<TCommand>> = new Map();
  private commandHistory: TCommand[] = [];
  private readonly maxHistorySize: number;

  constructor(maxHistorySize: number = 1000) {
    this.maxHistorySize = maxHistorySize;
  }

  register(type: string, handler: CommandHandler<TCommand>): void {
    this.handlers.set(type, handler);
  }

  async execute(command: TCommand): Promise<void> {
    const handler = this.handlers.get(command.type);
    if (!handler) {
      throw new Error(`No handler registered for command type: ${command.type}`);
    }

    await handler(command);
    this.addToHistory(command);
  }

  private addToHistory(command: TCommand): void {
    this.commandHistory.push(command);
    if (this.commandHistory.length > this.maxHistorySize) {
      this.commandHistory.shift();
    }
  }

  getHistory(): TCommand[] {
    return [...this.commandHistory];
  }

  clearHistory(): void {
    this.commandHistory = [];
  }

  dispose(): void {
    this.handlers.clear();
    this.commandHistory = [];
  }
} 