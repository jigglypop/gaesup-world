export declare const gameBoy: string;
export declare const gameBoyButtonRecipe: import("@vanilla-extract/recipes").RuntimeFn<{
    tag: {
        up: {
            gridRow: "1/2";
            gridColumn: "2/3";
        };
        left: {
            gridRow: "2/3";
            gridColumn: "1/2";
        };
        down: {
            gridRow: "3/4";
            gridColumn: "2/3";
        };
        right: {
            gridRow: "2/3";
            gridColumn: "3/4";
        };
    };
    direction: {
        up: {
            background: `var(--${string})` | `var(--${string}, ${string})` | `var(--${string}, ${number})`;
            boxShadow: "0 0 10px #78ffd6";
        };
        down: {
            background: `var(--${string})` | `var(--${string}, ${string})` | `var(--${string}, ${number})`;
            boxShadow: "0 0 10px #78ffd6";
        };
        left: {
            background: `var(--${string})` | `var(--${string}, ${string})` | `var(--${string}, ${number})`;
            boxShadow: "0 0 10px rgba(176,255,237,1)";
        };
        right: {
            background: `var(--${string})` | `var(--${string}, ${string})` | `var(--${string}, ${number})`;
            boxShadow: "0 0 10px rgba(176,255,237,1)";
        };
    };
}>;
