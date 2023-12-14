var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { defineProperties } from "@vanilla-extract/sprinkles";
import { boxShadow, boxShadowHover } from "../constants/boxshadow.css.js";
import { palette, rgba, theme, themeShadow, themeShadowHover, } from "../constants/palette.css.js";
import { gradient } from "../recipe/index.css.js";
var paletteTheme = __assign(__assign(__assign({}, palette), theme), rgba);
var paletteThemeGradient = __assign(__assign(__assign(__assign({}, palette), theme), gradient), rgba);
var boxShadows = __assign(__assign(__assign(__assign({}, boxShadow), boxShadowHover), themeShadow), themeShadowHover);
export var colorProperties = defineProperties({
    conditions: {
        default: {},
        hover: { selector: "&:hover" },
        active: { selector: "&:active" },
        focus: { selector: "&:focus" },
    },
    defaultCondition: "default",
    properties: {
        color: paletteTheme,
        backgroundColor: paletteThemeGradient,
        background: paletteThemeGradient,
        boxShadow: boxShadows,
        tranCursor: {
            true: {
                transition: "all 0.3s ease-in",
                cursor: "pointer",
            },
        },
        opacity: [
            "0",
            "0.1",
            "0.2",
            "0.3",
            "0.4",
            "0.5",
            "0.6",
            "0.7",
            "0.8",
            "0.9",
            "1",
        ],
    },
    shorthands: {
        bg: ["background"],
        bgc: ["backgroundColor"],
        c: ["color"],
        bs: ["boxShadow"],
        tc: ["tranCursor"],
        op: ["opacity"],
    },
});
