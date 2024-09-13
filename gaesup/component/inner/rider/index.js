import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useAnimations } from "@react-three/drei";
import { useGraph } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";
import playActions from "../../../animation/actions";
import { useGltfAndSize } from "../../../hooks/useGaesupGltf";
export default function RiderRef({ url, children, offset, currentAnimation, }) {
    const { gltf } = useGltfAndSize({ url });
    const { animations, scene } = gltf;
    const { actions, ref: animationRef } = useAnimations(animations);
    const characterClone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
    const { nodes: characterNodes } = useGraph(characterClone);
    const characterObjectNode = Object.values(characterNodes).find((node) => node.type === "Object3D");
    playActions({
        type: "character",
        currentAnimation: currentAnimation || "ride",
        actions,
        animationRef,
        isActive: false,
    });
    return (_jsx(_Fragment, { children: _jsxs("group", { position: offset, children: [characterObjectNode && (_jsx("primitive", { object: characterObjectNode, visible: false, receiveShadow: true, castShadow: true, ref: animationRef })), Object.keys(characterNodes).map((name, key) => {
                    const characterNode = characterNodes[name];
                    if (characterNode instanceof THREE.SkinnedMesh) {
                        return (_jsx("skinnedMesh", { castShadow: true, receiveShadow: true, material: characterNode.material, geometry: characterNode.geometry, skeleton: characterNode.skeleton }, key));
                    }
                    else if (characterNode instanceof THREE.Mesh) {
                        return (_jsx("mesh", { castShadow: true, receiveShadow: true, material: characterNode.material, geometry: characterNode.geometry }, key));
                    }
                }), children] }) }));
}
