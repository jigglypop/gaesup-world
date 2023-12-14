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
import { repeat } from "./constant.css.js";
export var gridTemplateRows = __assign(__assign({}, repeat), { writeA: "30rem 50rem 40rem 80rem", writeB: "30rem 50rem 80rem 80rem", "1,2": "1fr 2fr", "1,3": "1fr 3fr", "1,4": "1fr 4fr", "2,1": "2fr 1fr", "2,3": "2fr 3fr", "2,4": "2fr 4fr" });
export var gridTemplateColumns = __assign(__assign({}, repeat), { sideBar: "3rem 1fr", postA: "2fr 5fr 2fr", postB: "1fr", "1,2": "1fr 2fr", "1,3": "1fr 3fr", "1,4": "1fr 4fr", "2,1": "2fr 1fr", "2,3": "2fr 3fr", "2,4": "2fr 4fr" });
export var gridTemplate = {
    "15rem": "15rem 1fr 1fr",
    "10rem": "10rem 1fr 1fr",
};
export var gridTemplateAll = __assign(__assign(__assign({}, gridTemplate), gridTemplateRows), gridTemplateColumns);
