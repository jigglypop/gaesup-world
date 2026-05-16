export type CurrentInteraction = {
    id: string;
    label: string;
    key: string;
    distance: number;
} | null;
export declare function useCurrentInteraction(): CurrentInteraction;
export declare function useInteractionKey(enabled?: boolean): void;
export type InteractionTrackerProps = {
    throttleMs?: number;
};
export declare function InteractionTracker({ throttleMs }?: InteractionTrackerProps): null;
