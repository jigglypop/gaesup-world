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
import { useContext } from "react";
import { GaesupWorldContext, GaesupWorldDispatchContext, } from "../../world/context/index.js";
export var joyStickBallDefault = {
    top: "50%",
    left: "50%",
};
export var joyStickOriginDefault = {
    x: 0,
    y: 0,
    angle: Math.PI / 2,
    currentRadius: 0,
    originRadius: 0,
    isIn: true,
    isOn: false,
    isUp: true,
    isCenter: true,
};
export var joyStickInnerDefault = {
    joyStickBall: joyStickBallDefault,
    joyStickOrigin: joyStickOriginDefault,
};
export default function useJoyStick() {
    var joystick = useContext(GaesupWorldContext).joystick;
    var dispatch = useContext(GaesupWorldDispatchContext);
    var joyStickBall = joystick.joyStickBall, joyStickOrigin = joystick.joyStickOrigin;
    var setBall = function (ball) {
        joystick.joyStickBall = Object.assign(joyStickBall, ball);
        dispatch({
            type: "update",
            payload: {
                joystick: __assign(__assign({}, joystick), { joyStickBall: __assign({}, joystick.joyStickBall) }),
            },
        });
    };
    var setOrigin = function (origin) {
        joystick.joyStickOrigin = Object.assign(joyStickOrigin, origin);
        dispatch({
            type: "update",
            payload: {
                joystick: __assign(__assign({}, joystick), { joyStickOrigin: __assign({}, joystick.joyStickOrigin) }),
            },
        });
    };
    return {
        joyStickOrigin: joyStickOrigin,
        joyStickBall: joyStickBall,
        setBall: setBall,
        setOrigin: setOrigin,
    };
}
