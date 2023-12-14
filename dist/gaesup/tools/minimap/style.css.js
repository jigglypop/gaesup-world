import { keyframes, style } from "@vanilla-extract/css";
import { fixed, flex_absolute } from "../../../styles/recipe/index.css";
import { sprinkles } from "../../../styles/sprinkles/index.css";
import { vars } from "../../../styles/theme.css";
export var pulseWhite = keyframes({
    "0%": {
        boxShadow: "0 0 0 0 rgba(255, 255, 255, 0.7)",
        opacity: 1,
    },
    "70%": {
        boxShadow: "0 0 0 10px rgba(255, 255, 255, 0)",
        opacity: 0.7,
    },
    "100%": {
        boxShadow: "0 0 0 0 rgba(255, 255, 255, 0)",
        opacity: 1,
    },
});
export var avatar = style([
    flex_absolute({
        center: true,
    }),
    {
        width: "2rem",
        height: "2rem",
        borderRadius: "50%",
        background: "rgba(5,222,250,1)",
        boxShadow: "0 0 10px rgba(5,222,250,1)",
        border: "2px solid transparent",
        objectFit: "cover",
        zIndex: 100,
        animation: "".concat(pulseWhite, " 2s infinite"),
    },
]);
export var avatarImage = style([
    {
        width: "4rem",
        height: "4rem",
        borderRadius: "50%",
        background: vars.gradient.purple,
        border: "2px solid transparent",
        objectFit: "cover",
    },
]);
export var border = style([
    {
        width: "4rem",
        height: "4rem",
        borderRadius: "50%",
        boxShadow: "0 0 0 0 rgba(255, 255, 255, 1)",
        transform: "scale(1)",
        animation: "".concat(pulseWhite, " 2s infinite"),
        cursor: "pointer",
        transition: "all 0.5s ease-in",
        selectors: {
            "&:hover": {
                transform: "scale(1.1)",
            },
        },
    },
]);
export var minimap = style([
    fixed({
        north_east: true,
    }),
    sprinkles({
        w: {
            mobile: "12",
            tablet: "14",
            laptop: "16",
            desktop: "19",
        },
        h: {
            mobile: "12",
            tablet: "14",
            laptop: "16",
            desktop: "19",
        },
    }),
    {
        margin: "1rem",
        borderRadius: "50%",
        background: "rgba(0, 0, 0, 0.9)",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.9)",
        WebkitBackdropFilter: "blur(10px)",
        backdropFilter: "blur(10px)",
    },
]);
export var minimapOuter = style([
    flex_absolute({
        center: true,
    }),
]);
export var minimapInner = style([
    flex_absolute({
        center: true,
    }),
    sprinkles({
        w: {
            mobile: "11",
            tablet: "13",
            laptop: "15",
            desktop: "18",
        },
        h: {
            mobile: "11",
            tablet: "13",
            laptop: "15",
            desktop: "18",
        },
    }),
    {
        zIndex: 2,
        borderRadius: "50%",
        background: "rgba(0, 0, 0, 0.9)",
        overflow: "hidden",
    },
]);
export var text = style([
    {
        fontSize: "1rem",
        color: "white",
        textShadow: "0 0 10px black",
    },
]);
export var minimapObject = style([
    flex_absolute({}),
    {
        borderRadius: "2px",
        background: "rgba(99,251,215,0.4)",
        boxShadow: "0 0 10px rgba(99,251,215,0.4)",
        border: "2px solid rgba(99,251,215,1)",
        opacity: 0.5,
    },
]);
