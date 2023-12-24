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
import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { assignInlineVars } from "@vanilla-extract/dynamic";
import { useCallback, useContext, useEffect, useRef, useState, } from "react";
import { vars } from "../../../styles/theme.css";
import { GaesupWorldContext } from "../../world/context";
import useJoyStick from "./default";
import * as style from "./style.css";
export function JoyStick(props) {
    var outerRef = useRef(null);
    var childRef = useRef(null);
    var joyStickBallStyle = props.joyStickBallStyle, joyStickStyle = props.joyStickStyle;
    var mode = useContext(GaesupWorldContext).mode;
    var _a = useJoyStick(), joyStickBall = _a.joyStickBall, joyStickOrigin = _a.joyStickOrigin, setBall = _a.setBall, setOrigin = _a.setOrigin;
    var _b = useState({
        mouseDown: false,
        touchDown: false,
        position: "absolute",
        transform: "",
        background: "rgba(0, 0, 0, 0.5)",
        boxShadow: "0 0 10px  rgba(0, 0, 0, 0.5)",
    }), state = _b[0], setState = _b[1];
    var _c = useState({
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        width: 0,
        height: 0,
    }), screenSize = _c[0], setScreenSize = _c[1];
    var initBall = function () {
        setState(function (state) { return (__assign(__assign({}, state), { position: "absolute", transform: "translate(-50%, -50%)", background: "rgba(0, 0, 0, 0.5)", boxShadow: "0 0 10px  rgba(0, 0, 0, 0.5)" })); });
        setBall({
            top: "50%",
            left: "50%",
        });
    };
    var setMouseDown = function (value) {
        setState(function (state) { return (__assign(__assign({}, state), { mouseDown: value })); });
    };
    var setTouchDown = function (value) {
        setState(function (state) { return (__assign(__assign({}, state), { touchDown: value })); });
    };
    var initialize = function () {
        var client = outerRef.current.getBoundingClientRect();
        var x = client.left + client.width / 2;
        var y = client.top + client.height / 2;
        setScreenSize(function () { return ({
            top: client.top,
            left: client.left,
            bottom: client.bottom,
            right: client.right,
            width: client.width,
            height: client.height,
        }); });
        setOrigin({
            x: x,
            y: y,
            angle: Math.PI / 2,
            currentRadius: 0,
            originRadius: 0,
            isIn: true,
            isOn: false,
            isCenter: true,
            isUp: true,
        });
        initBall();
    };
    var resize = function () {
        if (!outerRef.current)
            return;
        var client = outerRef.current.getBoundingClientRect();
        setScreenSize(function () { return ({
            top: client.top,
            left: client.left,
            bottom: client.bottom,
            right: client.right,
            width: client.width,
            height: client.height,
        }); });
        // initBall();
    };
    var calcOriginBall = function (X, Y) {
        var top = screenSize.top, left = screenSize.left, bottom = screenSize.bottom, right = screenSize.right, width = screenSize.width, height = screenSize.height;
        if (top > Y || bottom < Y || left > X || right < X)
            return;
        var normX = Math.pow((joyStickOrigin.x - X), 2);
        var normY = Math.pow((joyStickOrigin.y - Y), 2);
        var currentRadius = Math.sqrt(normX + normY);
        var originRadius = Math.sqrt(Math.pow((width / 2), 2) + Math.pow((height / 2), 2));
        var newAngle = Math.atan2(Y - (bottom - height / 2), X - (left + width / 2));
        setOrigin({
            x: left + width / 2,
            y: bottom - height / 2,
            angle: newAngle,
            currentRadius: currentRadius,
            originRadius: originRadius,
            isIn: currentRadius > originRadius / 2,
            isOn: true,
            isCenter: currentRadius < originRadius / 4,
            isUp: top > Y - height / 2,
        });
        setState(function (state) { return (__assign(__assign({}, state), { position: "fixed", background: currentRadius > originRadius / 2
                ? vars.gradient.lightGreen
                : vars.gradient.green, boxShadow: "0 0 10px rgba(99,251,215,1)" })); });
        setBall({
            top: "".concat(Y, "px"),
            left: "".concat(X, "px"),
        });
    };
    var handleMouseOver = function (e) {
        if (!state.mouseDown)
            return;
        e.preventDefault();
        calcOriginBall(e.clientX, e.clientY);
    };
    var handleTouchMove = function (e) {
        if (!state.touchDown)
            return;
        e.preventDefault();
        calcOriginBall(e.touches[0].screenX, e.touches[0].screenY);
    };
    var handleTouchEnd = useCallback(function (e) {
        setState(function (state) { return (__assign(__assign({}, state), { touchDown: false })); });
        e.preventDefault();
        return initialize();
    }, [setBall, setState, setOrigin, state.touchDown]);
    var handleMouseOut = useCallback(function (e) {
        setState(function (state) { return (__assign(__assign({}, state), { mouseDown: false })); });
        e.preventDefault();
        return initialize();
    }, [setBall, setState, setOrigin, state.mouseDown]);
    useEffect(function () {
        window.addEventListener("resize", resize);
    }, []);
    useEffect(function () {
        if (outerRef.current) {
            initialize();
        }
    }, []);
    return (_jsx(_Fragment, { children: mode.controller === "joystick" && (_jsx("div", { className: style.joyStick, style: assignInlineVars(__assign({ position: "fixed" }, joyStickStyle)), ref: outerRef, onMouseDown: function (e) {
                e.preventDefault();
                setMouseDown(true);
            }, onMouseUp: function (e) {
                e.preventDefault();
                setMouseDown(false);
            }, onMouseMove: handleMouseOver, onMouseLeave: handleMouseOut, onTouchStart: function (e) {
                e.preventDefault();
                setTouchDown(true);
            }, onTouchEnd: handleTouchEnd, onTouchMove: handleTouchMove, onTouchCancel: handleTouchEnd, children: _jsx("div", { className: "".concat(style.joystickBall), ref: childRef, onMouseDown: function (e) {
                    e.preventDefault();
                    setMouseDown(true);
                }, onMouseUp: function (e) {
                    e.preventDefault();
                    setMouseDown(false);
                }, onMouseMove: handleMouseOver, onMouseLeave: handleMouseOut, onTouchStart: function (e) {
                    e.preventDefault();
                    setTouchDown(true);
                }, onTouchEnd: handleTouchEnd, onTouchMove: handleTouchMove, onTouchCancel: handleTouchEnd, style: assignInlineVars(__assign({ position: state.position, transform: state.transform, background: (joyStickBallStyle === null || joyStickBallStyle === void 0 ? void 0 : joyStickBallStyle.background) || state.background, boxShadow: (joyStickBallStyle === null || joyStickBallStyle === void 0 ? void 0 : joyStickBallStyle.boxShadow) || state.boxShadow, top: joyStickBall.top, left: joyStickBall.left }, joyStickBallStyle)) }) })) }));
}
