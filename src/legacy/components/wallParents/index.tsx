"use client";

import DeleteTag from "@common/deleteTag";
import { CuboidCollider } from "@react-three/rapier";
import useMeshQuery from "@store/mesh/query";
import { n3 } from "@store/update/type";
import useWall from "@store/wall";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { IWallInstance } from "./type";

const WallParent = ({ walls, wallParent, isUpdate }: IWallInstance) => {
  const W = 4;
  const H = 4;
  const D = 0.5;
  const { meshes } = useMeshQuery();
  const { onWallDelete } = useWall();

  const geometry = useMemo(() => {
    const geom = new THREE.BoxGeometry(W, H, D);
    geom.translate(0, 0, W / 2);
    return geom;
  }, [W, H, D]);

  // 기본 재질 (검정색)
  const defaultMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: 0x000000 }),
    []
  );

  const textureLoader = new THREE.TextureLoader();

  // 재질 생성 함수
  const createMaterial = (meshId: string | null) => {
    if (!meshId) return defaultMaterial;
    const mesh = meshes?.[meshId];
    if (!mesh) return defaultMaterial;

    let material;
    const baseOptions: THREE.MeshStandardMaterialParameters = {
      color: mesh.color || "#ffffff",
    };

    if (mesh.material === "GLASS") {
      material = new THREE.MeshPhysicalMaterial({
        ...baseOptions,
        transmission: 0.98,
        roughness: 0.1,
        envMapIntensity: 1,
      });
    } else if (
      !mesh.map_texture_url &&
      !mesh.normal_texture_url &&
      !(mesh.map_texture_url !== "") &&
      !(mesh.normal_texture_url !== "")
    ) {
      material = new THREE.MeshStandardMaterial(baseOptions);
    } else {
      material = new THREE.MeshStandardMaterial({
        map: textureLoader.load(mesh.map_texture_url, (texture) => {
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;

          const imageAspect = texture.image.width / texture.image.height;
          const wallAspect = W / H;
          let repeatX, repeatY;
          if (imageAspect > wallAspect) {
            // 이미지가 벽보다 더 넓은 경우
            repeatX = 1;
            repeatY = wallAspect / imageAspect;
          } else {
            // 이미지가 벽보다 더 높은 경우
            repeatX = imageAspect / wallAspect;
            repeatY = 1;
          }

          // 텍스처가 벽을 완전히 덮도록 반복 횟수 조정
          repeatX = Math.ceil(1 / repeatX);
          repeatY = Math.ceil(1 / repeatY);

          texture.repeat.set(repeatX, repeatY);
          texture.needsUpdate = true;
        }),
        normalMap: textureLoader.load(mesh.normal_texture_url, (texture) => {
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;

          const imageAspect = texture.image.width / texture.image.height;
          const wallAspect = W / H; // 4 / 6 = 2/3

          let repeatX, repeatY;

          if (imageAspect > wallAspect) {
            // 이미지가 벽보다 더 넓은 경우
            repeatX = 1;
            repeatY = wallAspect / imageAspect;
          } else {
            // 이미지가 벽보다 더 높은 경우
            repeatX = imageAspect / wallAspect;
            repeatY = 1;
          }

          // 텍스처가 벽을 완전히 덮도록 반복 횟수 조정
          repeatX = Math.ceil(1 / repeatX);
          repeatY = Math.ceil(1 / repeatY);

          texture.repeat.set(repeatX, repeatY);
          texture.needsUpdate = true;
        }),
      });
    }

    return material;
  };

  const materials = useMemo(
    () => [
      createMaterial(wallParent.bone_mesh_id),
      createMaterial(wallParent.bone_mesh_id),
      createMaterial(wallParent.bone_mesh_id),
      createMaterial(wallParent.bone_mesh_id),
      createMaterial(wallParent.front_mesh_id),
      createMaterial(wallParent.back_mesh_id),
    ],
    [
      wallParent.bone_mesh_id,
      wallParent.front_mesh_id,
      wallParent.back_mesh_id,
      wallParent.bone_mesh_id ? meshes?.[wallParent.bone_mesh_id]?.color : null,
      wallParent.bone_mesh_id
        ? meshes?.[wallParent.bone_mesh_id]?.material
        : null,
      wallParent.bone_mesh_id
        ? meshes?.[wallParent.bone_mesh_id]?.map_texture_url
        : null,
      wallParent.bone_mesh_id
        ? meshes?.[wallParent.bone_mesh_id]?.normal_texture_url
        : null,
      wallParent.front_mesh_id
        ? meshes?.[wallParent.front_mesh_id]?.color
        : null,
      wallParent.front_mesh_id
        ? meshes?.[wallParent.front_mesh_id]?.material
        : null,
      wallParent.front_mesh_id
        ? meshes?.[wallParent.front_mesh_id]?.map_texture_url
        : null,
      wallParent.front_mesh_id
        ? meshes?.[wallParent.front_mesh_id]?.normal_texture_url
        : null,
      wallParent.back_mesh_id ? meshes?.[wallParent.back_mesh_id]?.color : null,
      wallParent.back_mesh_id
        ? meshes?.[wallParent.back_mesh_id]?.material
        : null,
      wallParent.back_mesh_id
        ? meshes?.[wallParent.back_mesh_id]?.map_texture_url
        : null,
      wallParent.back_mesh_id
        ? meshes?.[wallParent.back_mesh_id]?.normal_texture_url
        : null,
    ]
  );

  const count = walls.length;

  const instancedMesh = useMemo(() => {
    const mesh = new THREE.InstancedMesh(geometry, materials, count);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    const dummy = new THREE.Object3D();
    walls.forEach((wall, i) => {
      dummy.position.set(
        wall.position[0],
        wall.position[1] + H / 2,
        wall.position[2]
      );
      dummy.rotation.set(0, wall.rotation[1], 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    return mesh;
  }, [walls, geometry, materials, count, H]);

  // 텍스처 변경 시 재질 업데이트
  useEffect(() => {
    materials.forEach((material) => {
      if (material instanceof THREE.Material) {
        material.needsUpdate = true;
      }
    });
  }, [materials]);

  return (
    <>
      {!isUpdate &&
        walls.map((wall, index) => {
          const rotationMatrix = new THREE.Matrix4().makeRotationY(
            wall.rotation[1]
          );
          const centerPoint = new THREE.Vector3(0, 0, W / 2);
          centerPoint.applyMatrix4(rotationMatrix);
          return (
            <CuboidCollider
              key={index}
              position={[
                wall.position[0] + centerPoint.x,
                wall.position[1] + H / 2,
                wall.position[2] + centerPoint.z,
              ]}
              rotation={[0, wall.rotation[1], 0]}
              args={[W / 2, H / 2, D / 2]}
            />
          );
        })}
      {isUpdate &&
        walls.map((wall, index) => {
          const id = wall.id;
          const wallParentId = wall.wall_parent_id;
          if (!id || !wallParentId) return null;
          // 회전된 위치 계산
          const rotatedPosition = (): n3 => {
            const rotationMatrix = new THREE.Matrix4().makeRotationY(
              wall.rotation[1]
            );
            const offsetVector = new THREE.Vector3(0, H + 0.1, W / 2);
            offsetVector.applyMatrix4(rotationMatrix);
            return [
              wall.position[0] + offsetVector.x,
              wall.position[1] + offsetVector.y,
              wall.position[2] + offsetVector.z,
            ];
          };
          return (
            <DeleteTag
              key={index}
              onClick={() => onWallDelete(id, wallParentId)}
              position={rotatedPosition()}
            />
          );
        })}
      <primitive object={instancedMesh} />
    </>
  );
};

export default WallParent;
