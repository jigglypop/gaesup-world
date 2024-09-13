import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useAnimations, useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
import playActions from "../../../animation/actions";
export const PartsGroupRef = ({ url, isActive, componentType, currentAnimation, color, skeleton, }) => {
    const { scene, animations } = useGLTF(url);
    const { actions, ref } = useAnimations(animations);
    const clonedMeshes = useMemo(() => {
        const meshes = [];
        scene.traverse((child) => {
            if (child instanceof THREE.SkinnedMesh) {
                const clonedMesh = child.clone();
                clonedMesh.skeleton = skeleton;
                clonedMesh.bind(skeleton, clonedMesh.bindMatrix);
                meshes.push(clonedMesh);
            }
        });
        return meshes;
    }, [scene, skeleton]);
    playActions({
        type: componentType,
        actions,
        animationRef: ref,
        currentAnimation: isActive ? undefined : currentAnimation,
        isActive,
    });
    return (_jsx(_Fragment, { children: clonedMeshes.map((mesh, key) => {
            return (_jsx("skinnedMesh", { castShadow: true, receiveShadow: true, geometry: mesh.geometry, skeleton: skeleton, material: mesh.name === "color" && color
                    ? new THREE.MeshStandardMaterial({ color })
                    : mesh.material }, key));
        }) }));
};
