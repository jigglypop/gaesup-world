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
import { persent, rem, size } from "../constants/constant.css.js";
var properties = __assign(__assign(__assign({}, persent), size), rem);
export var paddingProperties = defineProperties({
    conditions: {
        mobile: {},
        tablet: { "@media": "(min-width: 768px)" },
        laptop: { "@media": "(min-width: 1024px)" },
        desktop: { "@media": "(min-width: 1440px)" },
    },
    defaultCondition: "mobile",
    properties: {
        padding: properties,
        paddingBottom: properties,
        paddingTop: properties,
        paddingLeft: properties,
        paddingRight: properties,
    },
    shorthands: {
        p: ["padding"],
        pb: ["paddingBottom"],
        pt: ["paddingTop"],
        pl: ["paddingLeft"],
        pr: ["paddingRight"],
        pX: ["paddingLeft", "paddingRight"],
        pY: ["paddingTop", "paddingBottom"],
    },
});
