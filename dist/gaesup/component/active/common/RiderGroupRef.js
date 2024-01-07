import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useContext, useMemo } from "react";
import { useGraph } from "@react-three/fiber";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";
import playPassiveActions from "../../../animation/passiveActions";
import { GaesupWorldContext } from "../../../world/context";
export var RiderGroup = function (_a, ref) {
    var props = _a.props;
    var _b = useContext(GaesupWorldContext), characterGltf = _b.characterGltf, states = _b.states, characterCollider = _b.characterCollider;
    var characterAnimationRef = playPassiveActions({
        current: "ride",
        animations: characterGltf.animations,
    }).animationRef;
    var characterScene = characterGltf.scene;
    var characterClone = useMemo(function () { return SkeletonUtils.clone(characterScene); }, [characterScene]);
    var characterNodes = useGraph(characterClone).nodes;
    var characterObjectNode = Object.values(characterNodes).find(function (node) { return node.type === "Object3D"; });
    return (_jsx(_Fragment, { children: characterAnimationRef && (_jsxs("group", { position: [
                (characterCollider === null || characterCollider === void 0 ? void 0 : characterCollider.riderOffsetX) || 0,
                (characterCollider === null || characterCollider === void 0 ? void 0 : characterCollider.riderOffsetY) || 0,
                (characterCollider === null || characterCollider === void 0 ? void 0 : characterCollider.riderOffsetZ) || 0,
            ], children: [characterObjectNode && (_jsx("primitive", { object: characterObjectNode, visible: false, receiveShadow: true, castShadow: true, ref: characterAnimationRef })), Object.keys(characterNodes).map(function (name, key) {
                    var characterNode = characterNodes[name];
                    if (characterNode instanceof THREE.SkinnedMesh) {
                        return (_jsx("skinnedMesh", { castShadow: true, receiveShadow: true, material: characterNode.material, geometry: characterNode.geometry, skeleton: characterNode.skeleton }, key));
                    }
                    else if (characterNode instanceof THREE.Mesh) {
                        return (_jsx("mesh", { castShadow: true, receiveShadow: true, material: characterNode.material, geometry: characterNode.geometry }, key));
                    }
                })] })) }));
};
