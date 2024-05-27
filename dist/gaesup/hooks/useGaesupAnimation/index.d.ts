import { animationAtomType } from "../../world/context/type";
export declare function useGaesupAnimation({ type, }: {
    type: "character" | "vehicle" | "airplane";
}): {
    subscribe: ({ tag, condition, action, animationName, key, }: animationAtomType) => void;
    subscribeAll: (props: animationAtomType[]) => void;
    store: {};
    unsubscribe: (tag: string) => void;
    notify: () => string;
};
