import { jsx as _jsx } from "react/jsx-runtime";
import { vec3 } from "@react-three/rapier";
import playActions, { subscribeActions } from "../../../animation/actions";
import initCallback from "../../../controller/initialize/callback";
import { useGltfAndSize } from "../../../hooks/useGaesupGltf";
import { CharacterInnerRef, calcCharacterColliderProps, } from "../../inner/character";
import { setGroundRay } from "../../inner/common/setGroundRay";
export function CharacterRef(_a) {
    var props = _a.props, refs = _a.refs, urls = _a.urls;
    var colliderRef = refs.colliderRef;
    var _b = useGltfAndSize({ url: urls.characterUrl }), size = _b.size, gltf = _b.gltf;
    var collider = calcCharacterColliderProps(size);
    props.groundRay.offset = vec3({
        x: 0,
        y: (collider === null || collider === void 0 ? void 0 : collider.halfHeight) ? -(collider === null || collider === void 0 ? void 0 : collider.halfHeight) : -1,
        z: 0,
    });
    setGroundRay({
        groundRay: props.groundRay,
        length: (collider === null || collider === void 0 ? void 0 : collider.radius) || 0 + 2,
        colliderRef: colliderRef,
    });
    var animationResult = subscribeActions({
        type: "character",
        groundRay: props.groundRay,
        animations: gltf.animations,
    }).animationResult;
    var _c = playActions({
        type: "character",
        animationResult: animationResult,
    }), animationRef = _c.animationRef, currentAnimation = _c.currentAnimation;
    // callback
    initCallback({
        props: props,
        animationResult: animationResult,
        type: "character",
    });
    return (_jsx(CharacterInnerRef, { animationRef: animationRef, refs: refs, urls: urls, currentAnimation: currentAnimation, children: props.children }));
}
