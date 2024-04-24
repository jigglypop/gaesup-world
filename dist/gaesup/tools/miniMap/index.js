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
import { useCallback, useContext, useState } from "react";
import { GaesupWorldContext } from "../../world/context";
import { minimapDefault } from "./default";
import "./style.css";
// X 축은 동(+) 서(-) 방향, 즉 경도를 나타낸다.
// Z 축은 남(+) 북(-) 방향, 즉 위도를 나타낸다.
export function MiniMap(props) {
    var _a = useContext(GaesupWorldContext), minimap = _a.minimap, activeState = _a.activeState, mode = _a.mode;
    var _b = useState(props.scale || minimapDefault.scale), scale = _b[0], setscale = _b[1];
    var innerStyle = props.innerStyle, textStyle = props.textStyle, objectStyle = props.objectStyle, avatarStyle = props.avatarStyle, scaleStyle = props.scaleStyle, directionStyle = props.directionStyle, plusMinusStyle = props.plusMinusStyle, imageStyle = props.imageStyle;
    var upscale = useCallback(function () {
        var max = props.maxScale || minimapDefault.maxScale;
        setscale(function (scale) { return Math.min(max, scale + 0.1); });
    }, [setscale, scale]);
    var downscale = useCallback(function () {
        var min = props.minScale || minimapDefault.minScale;
        setscale(function (scale) { return Math.max(min, scale - 0.1); });
    }, [setscale, scale]);
    return (_jsxs("div", { className: "minimap", onWheel: function (e) {
            if (props.blockScale)
                return;
            if (e.deltaY <= 0)
                upscale();
            else
                downscale();
        }, children: [_jsx("div", { className: "minimapOuter", style: objectStyle }), _jsxs("div", { className: "minimapInner", style: __assign({ transform: props.blockRotate || mode.control === "normal"
                        ? "translate(-50%, -50%) rotate(180deg) "
                        : "translate(-50%, -50%) rotate(".concat((activeState.euler.y * 180) / Math.PI + 180, "deg) ") }, innerStyle), children: [" ", _jsx("div", { className: "east direction", style: __assign({ transform: props.blockRotate || mode.control === "normal"
                                ? "translate(-50%, -50%) rotate(180deg) "
                                : "translate(-50%, -50%) rotate(-".concat((activeState.euler.y * 180) / Math.PI + 180, "deg) ") }, directionStyle), children: "E" }), _jsx("div", { className: "west direction", style: __assign({ transform: props.blockRotate || mode.control === "normal"
                                ? "translate(50%, -50%) rotate(180deg) "
                                : "translate(50%, -50%) rotate(-".concat((activeState.euler.y * 180) / Math.PI + 180, "deg) ") }, directionStyle), children: "W" }), _jsx("div", { className: "south direction", style: __assign({ transform: props.blockRotate || mode.control === "normal"
                                ? "translate(-50%, 50%) rotate(180deg) "
                                : "translate(-50%, 50%) rotate(-".concat((activeState.euler.y * 180) / Math.PI + 180, "deg) ") }, directionStyle), children: "S" }), _jsx("div", { className: "north direction", style: __assign({ transform: props.blockRotate || mode.control === "normal"
                                ? "translate(-50%, -50%) rotate(180deg) "
                                : "translate(-50%, -50%) rotate(-".concat((activeState.euler.y * 180) / Math.PI + 180, "deg) ") }, directionStyle), children: "N" }), Object.values(minimap.props).map(function (_a, key) {
                        var center = _a.center, size = _a.size, text = _a.text;
                        var X = (center.x - activeState.position.x) *
                            (props.angle ? Math.sin(props.angle) : 1) *
                            scale;
                        var Z = (center.z - activeState.position.z) *
                            (props.angle ? -Math.cos(props.angle) : 1) *
                            scale;
                        return (_jsxs("div", { children: [_jsx("div", { className: "minimapObject", style: __assign({ width: "".concat(size.x * scale, "rem"), height: "".concat(size.z * scale, "rem"), top: "50%", left: "50%", transform: "translate(-50.1%, -50.1%) translate(".concat(-X, "rem, ").concat(-Z, "rem) rotate(").concat((Math.PI * 3) / 2 + props.angle || 0, "rad)"), transformOrigin: "50% 50%", zIndex: 1 + key }, objectStyle) }), key === 0 && (_jsx("div", { className: "imageObject", style: {
                                        width: "".concat(size.x * scale, "rem"),
                                        height: "".concat(size.z * scale, "rem"),
                                        top: "50%",
                                        left: "50%",
                                        transform: "translate(-50.1%, -50.1%) translate(".concat(-X, "rem, ").concat(-Z, "rem) rotate(").concat((Math.PI * 3) / 2 + props.angle || 0, "rad)"),
                                        transformOrigin: "50% 50%",
                                        zIndex: 10 + key,
                                    } })), _jsx("div", { className: "textObject", style: {
                                        width: "".concat(size.x * scale, "rem"),
                                        height: "".concat(size.z * scale, "rem"),
                                        top: "50.1%",
                                        left: "50.1%",
                                        transform: "translate(-50.1%, -50.1%) translate(".concat(-X, "rem, ").concat(-Z, "rem)"),
                                        transformOrigin: "50.1% 50.1%",
                                        zIndex: 1001 + key,
                                    }, children: text && (_jsx("div", { className: "text", style: __assign(__assign({}, textStyle), { zIndex: 1001 + key, transform: props.blockRotate || mode.control === "normal"
                                                ? " rotate(180deg) "
                                                : " rotate(-".concat((activeState.euler.y * 180) / Math.PI + 180, "deg) ") }), children: text })) })] }, key));
                    }), _jsx("div", { className: "avatar", style: avatarStyle })] }), !props.blockScaleControl && (_jsxs("div", { className: "scale", style: scaleStyle, children: [_jsx("div", { className: "plusMinus", style: plusMinusStyle, onClick: function () {
                            if (props.blockScale)
                                return;
                            downscale();
                        }, children: "+" }), "SCALE 1:", Math.round(100 / scale), _jsx("div", { className: "plusMinus", style: plusMinusStyle, onClick: function () {
                            if (props.blockScale)
                                return;
                            upscale();
                        }, children: "-" })] }))] }));
}
