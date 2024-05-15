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
import { jsx as _jsx } from "react/jsx-runtime";
import { CharacterInnerRef } from "../../inner/character";
export function CharacterRef(_a) {
    var children = _a.children, props = _a.props, refs = _a.refs, urls = _a.urls;
    return (_jsx(CharacterInnerRef, __assign({ url: urls.characterUrl, isActive: true, componentType: "character", rigidbodyType: "dynamic", controllerOptions: props.controllerOptions, groundRay: props.groundRay, onAnimate: props.onAnimate, onFrame: props.onFrame, onReady: props.onReady, onDestory: props.onDestory, rigidBodyProps: props.rigidBodyProps, parts: props.parts }, refs, { children: children })));
}
