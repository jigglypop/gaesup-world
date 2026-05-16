export type EventsTickerOptions = {
    onStarted?: (ids: string[]) => void;
    onEnded?: (ids: string[]) => void;
};
export declare function useEventsTicker(enabled?: boolean, opts?: EventsTickerOptions): void;
