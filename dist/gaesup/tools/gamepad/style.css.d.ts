export declare const gamePad: string;
export declare const gamePadGrid: string;
export declare const padButton: import("@vanilla-extract/recipes").RuntimeFn<{
    isClicked: {
        true: {
            background: `var(--${string})` | `var(--${string}, ${string})` | `var(--${string}, ${number})`;
            boxShadow: "0 0 1rem rgba(245,177,97,1)";
            color: "black";
            transition: "all 0.3s ease-in";
            ":hover": {
                boxShadow: "0 0 2rem rrgba(245,177,97,1)";
            };
        };
    };
}>;
