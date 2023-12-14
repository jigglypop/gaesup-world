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
import { useCallback, useContext, useEffect, useState } from "react";
import { GaesupWorldContext, GaesupWorldDispatchContext, } from "../../world/context";
import { GaesupToolsContext } from "../context";
import * as style from "./style.css";
export default function MiniMap() {
    var _a = useContext(GaesupWorldContext), minimapInner = _a.minimap, activeState = _a.activeState;
    var dispatch = useContext(GaesupWorldDispatchContext);
    var minimap = useContext(GaesupToolsContext).minimap;
    var _b = useState(minimap.ratio), ratio = _b[0], setRatio = _b[1];
    useEffect(function () {
        minimapInner.ratio = ratio;
        dispatch({
            type: "update",
            payload: {
                minimap: __assign({}, minimapInner),
            },
        });
    }, []);
    var upRatio = useCallback(function () {
        if (ratio >= 1)
            setRatio(function (prev) { return prev - 0.1; });
        else
            setRatio(function (prev) { return prev + 0.1; });
    }, [setRatio, ratio]);
    var downRatio = useCallback(function () {
        if (ratio <= 0)
            setRatio(function (prev) { return prev + 0.1; });
        else
            setRatio(function (prev) { return prev - 0.1; });
    }, [setRatio, ratio]);
    return (_jsxs("div", { className: style.minimap, 
        // style={assignInlineVars(minimap.minimapStyle || {})}
        onWheel: function (e) {
            if (e.deltaY > 0)
                downRatio();
            else
                upRatio();
        }, children: [_jsx("div", { className: style.minimapOuter }), _jsxs("div", { className: style.minimapInner, children: [Object.values(minimapInner.props).map(function (obj, key) {
                        return (_jsx("div", { className: style.minimapObject, style: assignInlineVars({
                                width: "".concat(obj.size.x, "rem"),
                                height: "".concat(obj.size.z, "rem"),
                                transform: "translate(".concat(-obj.center.x + activeState.position.x * ratio, "rem, ").concat(-obj.center.z + activeState.position.z * ratio, "rem)"),
                            }), children: _jsx("div", { className: style.text, children: obj.text }) }, key));
                    }), _jsx("div", { className: style.avatar, style: minimap.avatarStyle })] })] }));
}
