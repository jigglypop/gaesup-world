import { jsx as _jsx } from "react/jsx-runtime";
import { vec3 } from "@react-three/rapier";
import playActions, { subscribeActions } from "../../../animation/actions";
import initCallback from "../../../controller/initialize/callback";
import { useGltfAndSize } from "../../../hooks/useGaesupGltf";
import { AirplaneInnerRef } from "../../inner/airplane";
import { setGroundRay } from "../../inner/common/setGroundRay";
export function AirplaneRef(_a) {
    var children = _a.children, props = _a.props, groundRay = _a.groundRay, enableRiding = _a.enableRiding, isRiderOn = _a.isRiderOn, offset = _a.offset, refs = _a.refs, urls = _a.urls;
    var colliderRef = refs.colliderRef;
    var _b = useGltfAndSize({ url: urls.vehicleUrl }), size = _b.size, gltf = _b.gltf;
    groundRay.offset = vec3({
        x: 0,
        y: size.y * 5,
        z: 0,
    });
    setGroundRay({
        groundRay: groundRay,
        length: size.y * 5,
        colliderRef: colliderRef,
    });
    var animationResult = subscribeActions({
        type: "airplane",
        groundRay: groundRay,
        animations: gltf.animations,
    }).animationResult;
    var currentAnimation = playActions({
        type: "airplane",
        animationResult: animationResult,
    }).currentAnimation;
    // callback
    initCallback({
        props: props,
        animationResult: animationResult,
        type: "airplane",
    });
    return (_jsx(AirplaneInnerRef, { refs: refs, urls: urls, isRiderOn: isRiderOn, enableRiding: enableRiding, offset: offset, currentAnimation: currentAnimation, children: children }));
}
