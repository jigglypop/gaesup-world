import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { CapsuleCollider } from "@react-three/rapier";
import { useGltfAndSize } from "../../../hooks/useGaesupGltf";
import { InnerGroupRef } from "../common/InnerGroupRef";
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
export function CharacterInnerRef(_a) {
    var children = _a.children, refs = _a.refs, urls = _a.urls, position = _a.position, euler = _a.euler, currentAnimation = _a.currentAnimation;
    var outerGroupRef = refs.outerGroupRef, rigidBodyRef = refs.rigidBodyRef, colliderRef = refs.colliderRef, innerGroupRef = refs.innerGroupRef;
    var size = useGltfAndSize({ url: urls.characterUrl }).size;
    var collider = calcCharacterColliderProps(size);
    return (_jsx(_Fragment, { children: collider && (_jsxs(OuterGroupRef, { ref: outerGroupRef, children: [children, _jsxs(RigidBodyRef, { ref: rigidBodyRef, name: "character", position: position, rotation: euler, children: [_jsx(CapsuleCollider, { ref: colliderRef, args: [collider.height, collider.radius], position: [0, collider.height + collider.radius, 0] }), _jsx(InnerGroupRef, { type: "character", ref: innerGroupRef, url: urls.characterUrl, currentAnimation: currentAnimation })] })] })) }));
}
