import { type GameCommand, type ServerEvent, type StateDelta } from './contracts';
export type CommandAuthorityContext = {
    now: () => number;
    createId: (prefix: string, command: GameCommand) => string;
};
export type CommandAuthorityResult = {
    accepted: boolean;
    command: GameCommand;
    events: ServerEvent[];
    deltas: StateDelta[];
    serverRevision?: number;
    reason?: string;
};
export type CommandAuthorityHandler<TPayload = unknown> = (command: GameCommand<TPayload>, context: CommandAuthorityContext) => CommandAuthorityResult | Promise<CommandAuthorityResult>;
export type CommandAuthorityRoute = {
    domain: string;
    action?: string | '*';
};
export type CommandAuthorityRouter = {
    register: <TPayload = unknown>(route: CommandAuthorityRoute, handler: CommandAuthorityHandler<TPayload>) => () => void;
    handle: (command: GameCommand) => Promise<CommandAuthorityResult>;
    has: (route: CommandAuthorityRoute) => boolean;
    clear: () => void;
};
export type CommandAuthorityRouterOptions = {
    now?: () => number;
    createId?: (prefix: string, command: GameCommand) => string;
};
export type CreateCommandAcceptedResultOptions = {
    events?: ServerEvent[];
    deltas?: StateDelta[];
    serverRevision?: number;
};
export type CreateCommandRejectedResultOptions = {
    eventId?: string;
    occurredAt?: number;
    serverRevision?: number;
};
export declare function createCommandAcceptedResult(command: GameCommand, options?: CreateCommandAcceptedResultOptions): CommandAuthorityResult;
export declare function createCommandRejectedResult(command: GameCommand, reason: string, options?: CreateCommandRejectedResultOptions): CommandAuthorityResult;
export declare function createCommandAuthorityRouter(options?: CommandAuthorityRouterOptions): CommandAuthorityRouter;
