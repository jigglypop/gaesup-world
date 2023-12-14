import { style } from "@vanilla-extract/css";
import { fixed } from "../../styles/recipe/index.css";
export var footer = style([
    fixed({
        south: true,
    }),
    {
        width: "100%",
        height: "25rem",
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gridTemplateRows: "repeat(2, 1fr)",
    },
]);
export var footerUpper = style([
    {
        gridColumn: "1/4",
        gridRow: "1/2",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
]);
export var footerLower = style([
    {
        gridColumn: "1/4",
        gridRow: "2/3",
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
    },
]);
