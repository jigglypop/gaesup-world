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
import { recipe } from "@vanilla-extract/recipes";
import { fraction, repeat } from "../constants/constant.css.js";
import { clock, direction } from "../constants/direction.css.js";
import { aligns } from "../constants/flex.css.js";
import { gridTemplateAll } from "../constants/grid.css.js";
import { absolute_base, fixed_base, flex_base, glass_base, grid_base, relative_base, } from "./base.css.js";
export var glass = recipe({
    base: [glass_base],
});
export var baseVarients = __assign(__assign(__assign(__assign({}, direction), clock), aligns), { fullXY: {
        width: "full",
        height: "full",
    } });
export var gridVarient = __assign(__assign({}, repeat), gridTemplateAll);
export var gridVarients = {
    gridTemplateRows: gridVarient,
    gridTemplateColumns: gridVarient,
    gtr: gridVarient,
    gtc: gridVarient,
    gr: fraction,
    gc: fraction,
};
export var gridBaseVarients = __assign(__assign({}, baseVarients), gridVarients);
// relative
export var relative = recipe({
    base: [relative_base],
    variants: gridBaseVarients,
});
// absolute
export var absolute = recipe({
    base: [absolute_base],
    variants: __assign(__assign({}, gridBaseVarients), { center: {
            true: {
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
            },
        } }),
});
// fixed 모음
export var fixed = recipe({
    base: [fixed_base],
    variants: baseVarients,
});
export var flex = recipe({
    base: [flex_base],
    variants: __assign(__assign({}, baseVarients), gridVarients),
});
export var grid = recipe({
    base: [grid_base],
    variants: gridBaseVarients,
});
// flex_relative 합치기
export var flex_relative = recipe({
    base: [flex_base, relative_base],
    variants: gridBaseVarients,
});
// flex_absolute 합치기
export var flex_absolute = recipe({
    base: [flex_base, absolute_base],
    variants: __assign(__assign({}, gridBaseVarients), { center: {
            true: {
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
            },
        } }),
});
// flex_fixed 합치기
export var flex_fixed = recipe({
    base: [flex_base, fixed_base],
    variants: gridBaseVarients,
});
// grid_relative 합치기
export var grid_relative = recipe({
    base: [grid_base, relative_base],
    variants: gridBaseVarients,
});
// grid_absolute 합치기
export var grid_absolute = recipe({
    base: [grid_base, absolute_base],
    variants: gridBaseVarients,
});
// grid_fixed 합치기
export var grid_fixed = recipe({
    base: [grid_base, fixed_base],
    variants: gridBaseVarients,
});
// 그라디언트 모음
export var gradient = recipe({
    base: {
        background: "linear-gradient(45deg, #000000, #000000) padding-box,linear-gradient(45deg, #8e2de2, #4a00e0) border-box;",
    },
    variants: {
        purple: {
            background: "linear-gradient(45deg, #000000, #000000) padding-box,linear-gradient(45deg, #8e2de2, #4a00e0) border-box;",
        },
    },
});
