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
export function useGaesupAnimation(_a) {
    var type = _a.type;
    var animationState = useContext(GaesupWorldContext).animationState;
    var dispatch = useContext(GaesupWorldDispatchContext);
    var getAnimationTag = function (tag) {
        var animation = animationState[type].store[tag];
        if (!animation)
            return { name: animationState[type].default, isValid: false };
        if (animation.condition()) {
            return { name: animation.animationName, isValid: true };
        }
        else {
            return { name: animationState[type].default, isValid: false };
        }
    };
    var notify = function () {
        var tag = animationState[type].default;
        for (var _i = 0, _a = Object.keys(animationState[type].store); _i < _a.length; _i++) {
            var key = _a[_i];
            var checked = getAnimationTag(key);
            if (checked.isValid) {
                tag = checked.name;
                break;
            }
        }
        animationState[type].current = tag;
        dispatch({
            type: "update",
            payload: {
                animationState: __assign({}, animationState),
            },
        });
        return tag;
    };
    var unsubscribe = function (tag) {
        delete animationState[type].store[tag];
        dispatch({
            type: "update",
            payload: {
                animationState: __assign({}, animationState),
            },
        });
    };
    var subscribe = function (_a) {
        var tag = _a.tag, condition = _a.condition, action = _a.action, animationName = _a.animationName, key = _a.key;
        animationState[type].store[tag] = {
            condition: condition,
            action: action || (function () { }),
            animationName: animationName || tag,
            key: key || tag,
        };
        dispatch({
            type: "update",
            payload: {
                animationState: __assign({}, animationState),
            },
        });
    };
    var subscribeAll = function (props) {
        props.forEach(function (item) {
            animationState[type].store[item.tag] = {
                condition: item.condition,
                action: item.action,
                animationName: item.animationName,
                key: item.key,
            };
        });
        dispatch({
            type: "update",
            payload: {
                animationState: __assign({}, animationState),
            },
        });
    };
    return {
        subscribe: subscribe,
        subscribeAll: subscribeAll,
        store: animationState === null || animationState === void 0 ? void 0 : animationState[type].store,
        unsubscribe: unsubscribe,
        notify: notify,
    };
}
