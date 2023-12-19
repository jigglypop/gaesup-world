import { style } from "@vanilla-extract/css";
import { mobileButton } from "../../../styles/recipe/button.css";
import { fixed, flex } from "../../../styles/recipe/index.css";
export var jumpPoints = style([
    fixed({
        north: true,
    }),
    flex({
        row: "center",
    }),
    {
        top: "18rem",
        margin: "1rem",
        zIndex: 1000,
    },
]);
export var jumpPoint = style([
    mobileButton({}),
    flex({}),
    {
        margin: "1rem",
        fontSize: "0.8rem",
        borderRadius: "50%",
        width: "5rem",
        height: "5rem",
        color: "white",
        background: "rgba(0, 0, 0, 0.6)",
        boxShadow: "0 0 5px 0 rgba(0, 0, 0, 0.6)",
        transition: "all 0.2s ease-in",
        cursor: "pointer",
    },
]);
