export type DecorationWeights = {
    tile?: number;
    wall?: number;
    placedObject?: number;
    base?: number;
};
export declare function useDecorationScore(enabled?: boolean, weights?: DecorationWeights): void;
