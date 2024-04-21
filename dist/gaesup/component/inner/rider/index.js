import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useAnimations } from "@react-three/drei";
import { useGraph } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";
import playActions from "../../../animation/actions";
import { useGltfAndSize } from "../../../hooks/useGaesupGltf";
export default function RiderRef(_a) {
    var urls = _a.urls, children = _a.children, offset = _a.offset, euler = _a.euler, currentAnimation = _a.currentAnimation;
    var gltf = useGltfAndSize({ url: urls.characterUrl }).gltf;
    var animations = gltf.animations, scene = gltf.scene;
    var _b = useAnimations(animations), actions = _b.actions, animationRef = _b.ref;
    playActions({
        type: "character",
        currentAnimation: currentAnimation || "ride",
        actions: actions,
        animationRef: animationRef,
        isActive: false,
    });
    var characterClone = useMemo(function () { return SkeletonUtils.clone(scene); }, [scene]);
    var characterNodes = useGraph(characterClone).nodes;
    var characterObjectNode = Object.values(characterNodes).find(function (node) { return node.type === "Object3D"; });
    return (_jsx(_Fragment, { children: _jsxs("group", { position: offset, rotation: euler, children: [characterObjectNode && (_jsx("primitive", { object: characterObjectNode, visible: false, receiveShadow: true, castShadow: true, ref: animationRef })), Object.keys(characterNodes).map(function (name, key) {
                    var characterNode = characterNodes[name];
                    if (characterNode instanceof THREE.SkinnedMesh) {
                        return (_jsx("skinnedMesh", { castShadow: true, receiveShadow: true, material: characterNode.material, geometry: characterNode.geometry, skeleton: characterNode.skeleton }, key));
                    }
                    else if (characterNode instanceof THREE.Mesh) {
                        return (_jsx("mesh", { castShadow: true, receiveShadow: true, material: characterNode.material, geometry: characterNode.geometry }, key));
                    }
                }), children] }) }));
}
