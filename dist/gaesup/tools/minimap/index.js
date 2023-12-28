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
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { assignInlineVars } from "@vanilla-extract/dynamic";
import { useCallback, useContext, useState } from "react";
import { GaesupWorldContext } from "../../world/context";
import { minimapDefault } from "./default";
import * as style from "./style.css";
// X 축은 동(+) 서(-) 방향, 즉 경도를 나타낸다.
// Z 축은 남(+) 북(-) 방향, 즉 위도를 나타낸다.
export function MiniMap(props) {
    var _a = useContext(GaesupWorldContext), minimap = _a.minimap, activeState = _a.activeState;
    var _b = useState(props.scale || minimapDefault.scale), scale = _b[0], setscale = _b[1];
    var minimapStyle = props.minimapStyle, innerStyle = props.innerStyle, textStyle = props.textStyle, objectStyle = props.objectStyle, avatarStyle = props.avatarStyle, scaleStyle = props.scaleStyle, directionStyle = props.directionStyle, plusMinusStyle = props.plusMinusStyle;
    var upscale = useCallback(function () {
        var max = props.maxScale || minimapDefault.maxScale;
        setscale(function (scale) { return Math.min(max, scale + 0.1); });
    }, [setscale, scale]);
    var downscale = useCallback(function () {
        var min = props.minScale || minimapDefault.minScale;
        setscale(function (scale) { return Math.max(min, scale - 0.1); });
    }, [setscale, scale]);
    return (_jsxs("div", { className: style.minimap, onWheel: function (e) {
            if (props.blockScale)
                return;
            if (e.deltaY <= 0)
                upscale();
            else
                downscale();
        }, style: assignInlineVars(minimapStyle), children: [_jsx("div", { className: style.minimapOuter, style: assignInlineVars(objectStyle) }), _jsxs("div", { className: style.minimapInner, style: assignInlineVars(__assign({ transform: props.blockRotate
                        ? "translate(-50%, -50%) rotate(180deg) "
                        : "translate(-50%, -50%) rotate(".concat((activeState.euler.y * 180) / Math.PI + 180, "deg) ") }, innerStyle)), children: [_jsx("div", { className: style.direction({
                            east: true,
                        }), style: assignInlineVars(directionStyle), children: "E" }), _jsx("div", { className: style.direction({
                            west: true,
                        }), style: assignInlineVars(directionStyle), children: "W" }), _jsx("div", { className: style.direction({
                            south: true,
                        }), style: assignInlineVars(directionStyle), children: "S" }), _jsx("div", { className: style.direction({ north: true }), style: assignInlineVars(directionStyle), children: "N" }), Object.values(minimap.props).map(function (_a, key) {
                        var center = _a.center, size = _a.size, text = _a.text;
                        var X = (center.x - activeState.position.x) * scale;
                        var Z = (center.z - activeState.position.z) * scale;
                        return (_jsx("div", { className: style.minimapObject, style: assignInlineVars(__assign({ width: "".concat(size.x * scale, "rem"), height: "".concat(size.z * scale, "rem"), top: "50%", left: "50%", transform: "translate(-50%, -50%) translate(".concat(-X, "rem, ").concat(-Z, "rem)"), transformOrigin: "50% 50%" }, objectStyle)), children: text && (_jsx("div", { className: style.text, style: assignInlineVars(textStyle), children: text })) }, key));
                    }), _jsx("div", { className: style.avatar, style: assignInlineVars(avatarStyle) })] }), !props.blockScaleControl && (_jsxs("div", { className: style.scale, style: assignInlineVars(scaleStyle), children: [_jsx("div", { className: style.plusMinus, style: assignInlineVars(plusMinusStyle), onClick: function () {
                            if (props.blockScale)
                                return;
                            downscale();
                        }, children: "+" }), "SCALE 1:", Math.round(100 / scale), _jsx("div", { className: style.plusMinus, style: assignInlineVars(plusMinusStyle), onClick: function () {
                            if (props.blockScale)
                                return;
                            upscale();
                        }, children: "-" })] }))] }));
}
