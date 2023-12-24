export declare const button: import("@vanilla-extract/recipes").RuntimeFn<{
    purple: {
        true: {
            background: `var(--${string})` | `var(--${string}, ${string})` | `var(--${string}, ${number})`;
            boxShadow: string;
            ":hover": {
                boxShadow: string;
            };
        };
    };
    gray: {
        true: {
            background: string;
            boxShadow: string;
            ":hover": {
                boxShadow: string;
            };
        };
    };
    glass: {
        true: {
            color: `var(--${string})` | `var(--${string}, ${string})` | `var(--${string}, ${number})`;
            background: `var(--${string})` | `var(--${string}, ${string})` | `var(--${string}, ${number})`;
            boxShadow: `0 0 5px var(--${string})` | `0 0 5px var(--${string}, ${string})` | `0 0 5px var(--${string}, ${number})`;
            ":hover": {
                boxShadow: `0 0 10px var(--${string})` | `0 0 10px var(--${string}, ${string})` | `0 0 10px var(--${string}, ${number})`;
            };
        };
    };
    black: {
        false: {
            background: string;
        };
        true: {
            background: string;
            color: string;
        };
    };
}>;
export declare const mobileButton: import("@vanilla-extract/recipes").RuntimeFn<{
    character: {
        true: {
            background: `var(--${string})` | `var(--${string}, ${string})` | `var(--${string}, ${number})`;
            boxShadow: "0 0 1rem rgba(5,222,250,1)";
            color: "black";
            ":hover": {
                boxShadow: "0 0 2rem rgba(5,222,250,1)";
            };
        };
    };
    control: {
        true: {
            background: `var(--${string})` | `var(--${string}, ${string})` | `var(--${string}, ${number})`;
            boxShadow: "0 0 1rem rgba(245,177,97,1)";
            color: "black";
            ":hover": {
                boxShadow: "0 0 2rem rrgba(245,177,97,1)";
            };
        };
    };
}>;
