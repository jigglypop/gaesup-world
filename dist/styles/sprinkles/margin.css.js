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
export var marginProperties = defineProperties({
    conditions: {
        mobile: {},
        tablet: { "@media": "(min-width: 768px)" },
        laptop: { "@media": "(min-width: 1024px)" },
        desktop: { "@media": "(min-width: 1440px)" },
    },
    defaultCondition: "mobile",
    properties: {
        margin: properties,
        marginBottom: properties,
        marginTop: properties,
        marginLeft: properties,
        marginRight: properties,
    },
    shorthands: {
        m: ["margin"],
        mb: ["marginBottom"],
        mt: ["marginTop"],
        ml: ["marginLeft"],
        mr: ["marginRight"],
        mX: ["marginLeft", "marginRight"],
        mY: ["marginTop", "marginBottom"],
    },
});
