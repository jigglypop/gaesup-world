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
import { gaesupWorldDefault } from "../../world/context";
import { gaesupWorldReducer } from "../../world/context/reducer";
import initDebug from "../debug";
import initColider from "./collider";
export default function initGaesupWorld(props) {
    var _a = useReducer(gaesupWorldReducer, {
        debug: props.debug || gaesupWorldDefault.debug,
        activeState: gaesupWorldDefault.activeState,
        characterCollider: Object.assign(gaesupWorldDefault.characterCollider, props.characterCollider || {}),
        vehicleCollider: Object.assign(gaesupWorldDefault.vehicleCollider, props.vehicleCollider || {}),
        airplaneCollider: Object.assign(gaesupWorldDefault.airplaneCollider, props.airplaneCollider || {}),
        cameraOption: Object.assign(gaesupWorldDefault.cameraOption, props.cameraOption || {}),
        mode: Object.assign(gaesupWorldDefault.mode, props.mode || {}),
        url: Object.assign(gaesupWorldDefault.url, props.url || {}),
        characterGltf: null,
        vehicleGltf: null,
        wheelGltf: null,
        airplaneGltf: null,
        refs: null,
        states: gaesupWorldDefault.states,
        minimap: gaesupWorldDefault.minimap,
        joystick: gaesupWorldDefault.joystick,
        control: gaesupWorldDefault.control,
        animations: gaesupWorldDefault.animations,
        keyBoardMap: gaesupWorldDefault.keyBoardMap,
    }), value = _a[0], dispatch = _a[1];
    useEffect(function () {
        var _a;
        var keyboard = (_a = value.keyBoardMap) === null || _a === void 0 ? void 0 : _a.reduce(function (maps, keyboardMapItem) {
            maps[keyboardMapItem.name] = false;
            return maps;
        }, {});
        var assignedControl = Object.assign(value.control, keyboard);
        dispatch({
            type: "update",
            payload: {
                control: __assign({}, assignedControl),
            },
        });
    }, []);
    var gaesupProps = useMemo(function () { return ({ value: value, dispatch: dispatch }); }, [value, dispatch]);
    initColider({ value: value, dispatch: dispatch });
    initDebug({ value: value, dispatch: dispatch });
    return {
        gaesupProps: gaesupProps,
    };
}
