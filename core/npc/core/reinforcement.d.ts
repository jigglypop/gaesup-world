export type ReinforcementAdapterConfig = {
    endpoint: string;
    apiKey?: string;
    timeoutMs: number;
    minRequestIntervalMs: number;
    headers?: Record<string, string>;
    fallbackToScriptedBehavior: boolean;
};
export declare function configureReinforcementAdapter(config: Partial<ReinforcementAdapterConfig>): ReinforcementAdapterConfig;
export declare function getReinforcementAdapterConfig(): ReinforcementAdapterConfig;
export declare function registerDefaultReinforcementAdapter(): void;
