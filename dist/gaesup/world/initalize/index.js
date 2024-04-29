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
import { useEffect, useMemo, useReducer } from "react";
import { isDesktop } from "react-device-detect";
import { gaesupWorldDefault } from "../../world/context";
import { gaesupWorldReducer } from "../../world/context/reducer";
import initDebug from "../debug";
export default function initGaesupWorld(props) {
    var _a = useReducer(gaesupWorldReducer, {
        activeState: __assign(__assign({}, gaesupWorldDefault.activeState), { position: props.startPosition || gaesupWorldDefault.activeState.position }),
        cameraOption: Object.assign(gaesupWorldDefault.cameraOption, props.cameraOption || {}),
        mode: Object.assign(gaesupWorldDefault.mode, props.mode || {}),
        urls: Object.assign(gaesupWorldDefault.urls, props.urls || {}),
        refs: null,
        states: gaesupWorldDefault.states,
        rideable: gaesupWorldDefault.rideable,
        debug: (props.debug && isDesktop) || gaesupWorldDefault.debug,
        minimap: gaesupWorldDefault.minimap,
        joystick: gaesupWorldDefault.joystick,
        control: gaesupWorldDefault.control,
        clicker: gaesupWorldDefault.clicker,
        clickerOption: Object.assign(gaesupWorldDefault.clickerOption, props.clickerOption || {}),
        animationState: gaesupWorldDefault.animationState,
        keyBoardMap: Object.assign(gaesupWorldDefault.keyBoardMap, props.keyBoardMap || {}),
        moveTo: null,
        block: Object.assign(gaesupWorldDefault.block, props.block || {}),
        sizes: gaesupWorldDefault.sizes,
        callback: {
            moveTo: null,
        },
    }), value = _a[0], dispatch = _a[1];
    useEffect(function () {
        var _a;
        var keyboard = (_a = value.keyBoardMap) === null || _a === void 0 ? void 0 : _a.reduce(function (maps, keyboardMapItem) {
            maps[keyboardMapItem.name] = false;
            return maps;
        }, {});
        var assignedControl = Object.assign(value.control, keyboard);
        if (value.block.scroll)
            window.addEventListener("touchmove", function (e) { return e.preventDefault(); }, {
                passive: false,
            });
        dispatch({
            type: "update",
            payload: {
                control: __assign({}, assignedControl),
            },
        });
    }, []);
    var gaesupProps = useMemo(function () { return ({ value: value, dispatch: dispatch }); }, [value, value.block, dispatch]);
    initDebug({ value: gaesupProps.value, dispatch: dispatch });
    return {
        gaesupProps: gaesupProps,
    };
}
