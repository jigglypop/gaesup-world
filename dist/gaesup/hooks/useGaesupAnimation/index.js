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
import { GaesupWorldContext, GaesupWorldDispatchContext, } from "../../world/context";
export function useGaesupAnimation() {
    var animations = useContext(GaesupWorldContext).animations;
    var dispatch = useContext(GaesupWorldDispatchContext);
    var getAnimationTag = function (tag) {
        var animation = animations.store[tag];
        if (!animation)
            return { name: animations.default, isValid: false };
        if (animation.condition()) {
            return { name: animation.animationName, isValid: true };
        }
        else {
            return { name: animations.default, isValid: false };
        }
    };
    var notify = function () {
        var tag = animations.default;
        for (var _i = 0, _a = Object.keys(animations.store); _i < _a.length; _i++) {
            var key = _a[_i];
            var checked = getAnimationTag(key);
            if (checked.isValid) {
                tag = checked.name;
                break;
            }
        }
        animations.current = tag;
        dispatch({
            type: "update",
            payload: {
                animations: __assign({}, animations),
            },
        });
        return tag;
    };
    var unsubscribe = function (tag) {
        delete animations.store[tag];
        dispatch({
            type: "update",
            payload: {
                animations: __assign({}, animations),
            },
        });
    };
    var subscribe = function (_a) {
        var tag = _a.tag, condition = _a.condition, action = _a.action, animationName = _a.animationName, key = _a.key;
        animations.store[tag] = {
            condition: condition,
            action: action || (function () { }),
            animationName: animationName || tag,
            key: key || tag,
        };
        dispatch({
            type: "update",
            payload: {
                animations: __assign({}, animations),
            },
        });
    };
    var subscribeAll = function (props) {
        props.forEach(function (item) {
            animations.store[item.tag] = {
                condition: item.condition,
                action: item.action,
                animationName: item.animationName,
                key: item.key,
            };
        });
        dispatch({
            type: "update",
            payload: {
                animations: __assign({}, animations),
            },
        });
    };
    return {
        subscribe: subscribe,
        subscribeAll: subscribeAll,
        store: animations.store,
        unsubscribe: unsubscribe,
        notify: notify,
    };
}
