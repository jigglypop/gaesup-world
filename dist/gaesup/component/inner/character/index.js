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
import { OuterGroupRef } from "../common/OuterGroupRef";
import { RigidBodyRef } from "../common/RigidbodyRef";
export var calcCharacterColliderProps = function (characterSize) {
    if (!characterSize)
        return null;
    var heightPlusDiameter = characterSize.y / 2;
    var diameter = Math.max(characterSize.x, characterSize.z);
    var radius = diameter / 2;
    var height = heightPlusDiameter - radius;
    var halfHeight = height / 2;
    return {
        height: height,
        halfHeight: halfHeight,
        radius: radius,
        diameter: diameter,
    };
};
export function CharacterInnerRef(props) {
    var _a = props.refs, outerGroupRef = _a.outerGroupRef, rigidBodyRef = _a.rigidBodyRef, colliderRef = _a.colliderRef, innerGroupRef = _a.innerGroupRef;
    return (_jsx(OuterGroupRef, { ref: outerGroupRef, children: _jsx(RigidBodyRef, __assign({ ref: rigidBodyRef, name: "character", url: props.urls.characterUrl, outerGroupRef: outerGroupRef, innerGroupRef: innerGroupRef, rigidBodyRef: rigidBodyRef, colliderRef: colliderRef }, props, { children: props.children })) }));
}
