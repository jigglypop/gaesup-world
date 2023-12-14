import { style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";
import { fixed, grid } from "../../../styles/recipe/index.css.js";
import { vars } from "../../../styles/theme.css.js";
export var gamePad = style([
    fixed({
        south_east: true,
    }),
    {
        marginRight: "5rem",
        width: "12rem",
        zIndex: 10000,
    },
]);
export var gamePadGrid = style([
    grid({
        row: "center",
    }),
    {
        gridTemplateColumns: "repeat(2, 1fr)",
        gridTemplateRows: "repeat(3, 1fr)",
    },
]);
export var padButton = recipe({
    base: [
        {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
            width: "5rem",
            height: "5rem",
            borderRadius: "50%",
            fontSize: "1rem",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            color: "white",
            boxShadow: "0 0 0.5rem rgba(0, 0, 0, 0.5)",
            cursor: "pointer",
            transition: "all 0.3s ease-in",
            margin: "0.5rem",
            ":hover": {
                boxShadow: "0 0 1rem rgba(0, 0, 0, 0.5)",
            },
            ":after": {
                content: "''",
                position: "absolute",
                width: "4rem",
                height: "4rem",
                borderRadius: "50%",
                background: "rgba(0, 0, 0, 0.2)",
                zIndex: 100000,
            },
        },
    ],
    variants: {
        isClicked: {
            true: {
                background: vars.gradient.red,
                boxShadow: "0 0 1rem rgba(245,177,97,1)",
                color: "black",
                transition: "all 0.3s ease-in",
                ":hover": {
                    boxShadow: "0 0 2rem rrgba(245,177,97,1)",
                },
            },
        },
    },
});
