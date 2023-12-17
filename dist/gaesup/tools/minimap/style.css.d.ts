export declare const pulseWhite: string;
export declare const avatar: string;
export declare const plusMinus: string;
export declare const avatarImage: string;
export declare const border: string;
export declare const minimap: string;
export declare const minimapOuter: string;
export declare const minimapInner: string;
export declare const text: string;
export declare const scale: string;
export declare const minimapObject: string;
export declare const direction: import("@vanilla-extract/recipes").RuntimeFn<{
    east: {
        true: {
            top: "50%";
            transform: "translateY(-50%)";
            left: number;
        };
    };
    west: {
        true: {
            top: "50%";
            transform: "translateY(-50%)";
            right: number;
        };
    };
    north: {
        true: {
            top: number;
            transform: "translateX(-50%)";
            left: "50%";
        };
    };
    south: {
        true: {
            bottom: number;
            transform: "translateX(-50%)";
            left: "50%";
        };
    };
}>;
