import { style } from "@vanilla-extract/css";
import { fixed } from "../styles/recipe/index.css";
import { vars } from "../styles/theme.css";
export var debug = style([
    fixed({
        south_east: true,
    }),
    {
        overflowY: "scroll",
        margin: "2rem",
        width: "40rem",
        height: "30rem",
        zIndex: 100000,
        background: vars.themes.debug,
        borderRadius: "1rem",
        boxShadow: "0 0 0.5rem rgba(0, 0, 0, 0.2)",
    },
]);
export var debugItem = style({
    position: "relative",
    paddingLeft: "1rem",
    fontSize: "0.8em",
    color: vars.themes.text.normal,
});