import NameTag from "@common/spriteTag";
import { S3_URL } from "@constants/url";
import { useGLTF } from "@react-three/drei";
import { useGraph } from "@react-three/fiber";
import { RigidBody } from "@react-three/rapier";
import useThreeObject from "@store/threeObject";
import { threeObjectType } from "@store/threeObject/type";
import { isEqual } from "@utils/getTag";
import { Elr } from "gaesup-world";
import React, { memo, useCallback, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";
import { MemoizedMesh } from "./meshes/mesh";
import { MemoizedPampletMesh } from "./meshes/pamplet";
import { MemoizedPosterMesh } from "./meshes/poster";

export interface ThreeObjectProps extends threeObjectType {}

const ThreeObject: React.FC<ThreeObjectProps> = ({
  gltf_url,
  three_object_id,
  position = [0, 0, 0],
  rotation = Elr(0, 0, 0),
  scale = [1, 1, 1],
  object_name,
  isUpdate,
  isEditor,
  color,
  pamplet_url,
  poster_url,
}) => {
  if (!gltf_url || !three_object_id) return null;
  const url = useMemo(() => gltf_url || `${S3_URL}/picture.glb`, [gltf_url]);
  // GLTF 모델 로드
  const { scene } = useGLTF(url, true);
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { nodes } = useGraph(clone);
  const { onThreeObjectDelete, setItemType } = useThreeObject();
  const groupRef = useRef<THREE.Group>(null);
  // 삭제 콜백을 메모이제이션
  const onDelete = useCallback(() => {
    onThreeObjectDelete(three_object_id);
  }, [onThreeObjectDelete, three_object_id]);
  // 메쉬 노드 필터링 및 메모이제이션
  const meshNodes = useMemo(
    () =>
      Object.values(nodes).filter(
        (node) => node instanceof THREE.Mesh
      ) as THREE.Mesh[],
    [nodes]
  );
  // GLTF 모델 사전 로드
  useEffect(() => {
    if (gltf_url) {
      useGLTF.preload(url);
    }
  }, [gltf_url, url]);
  // 에디터 모드일 때 아이템 타입 설정
  useEffect(() => {
    if (isEditor) {
      const meshMap: {
        color: boolean;
        pamplet_url: boolean;
        poster_url: boolean;
      } = {
        color: false,
        pamplet_url: false,
        poster_url: false,
      };

      meshNodes.forEach((node) => {
        const firstWord = node.name.split("_")[0].toLowerCase();
        if (firstWord === "color") {
          meshMap.color = true;
        } else if (firstWord === "pamplet") {
          meshMap.pamplet_url = true;
        } else if (firstWord === "poster") {
          meshMap.poster_url = true;
        }
      });
      setItemType(meshMap);
    }
  }, [meshNodes, isEditor, setItemType]);

  useEffect(() => {
    return () => {
      [scene, clone].forEach((currentScene) => {
        if (currentScene) {
          currentScene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.geometry.dispose();
              if (Array.isArray(child.material)) {
                child.material.forEach((material) => material.dispose());
              } else {
                child.material.dispose();
              }
            }
          });
        }
      });
    };
  }, [clone, scene]);

  useEffect(() => {
    return () => {
      if (groupRef.current) {
        groupRef.current.clear();
      }
    };
  }, []);

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={scale}>
      {isUpdate && (
        <group
          onClick={onDelete}
          position={[0, 4, 0]}
          scale={[1 / scale[0], 1 / scale[1], 1 / scale[2]]}>
          <NameTag
            text={object_name.split("_")[0]}
            fontSize={0.8}
            background="rgba(0, 0, 0, 0.2)"
          />
        </group>
      )}

      <RigidBody
        type="fixed"
        colliders="cuboid">
        {meshNodes.map((node, key) => {
          if (isEqual("color", node)) {
            return (
              <MemoizedMesh
                key={key}
                node={node}
                color={color}
              />
            );
          } else if (isEqual("pamplet", node)) {
            return (
              <MemoizedPampletMesh
                key={node.name}
                geometry={node.geometry}
                pamplet_url={pamplet_url}
              />
            );
          } else if (isEqual("poster", node)) {
            return (
              <MemoizedPosterMesh
                key={key}
                node={node}
                poster_url={poster_url}
              />
            );
          } else {
            return (
              <MemoizedMesh
                key={key}
                node={node}
                color={color}
              />
            );
          }
        })}
      </RigidBody>
    </group>
  );
};

// 커스텀 비교 함수: props가 동일한지 확인
const areEqual = (prevProps: ThreeObjectProps, nextProps: ThreeObjectProps) => {
  // 기본적인 props 비교
  if (
    prevProps.gltf_url !== nextProps.gltf_url ||
    prevProps.three_object_id !== nextProps.three_object_id ||
    prevProps.object_name !== nextProps.object_name ||
    prevProps.isUpdate !== nextProps.isUpdate ||
    prevProps.isEditor !== nextProps.isEditor ||
    prevProps.color !== nextProps.color ||
    prevProps.pamplet_url !== nextProps.pamplet_url ||
    prevProps.poster_url !== nextProps.poster_url
  ) {
    return false;
  }

  const arrayProps = ["position", "rotation", "scale"] as const;
  for (const prop of arrayProps) {
    const prevArr = prevProps[prop];
    const nextArr = nextProps[prop];
    if (!prevArr || !nextArr) return false;
    if (prevArr.length !== nextArr.length) return false;
    for (let i = 0; i < prevArr.length; i++) {
      if (prevArr[i] !== nextArr[i]) return false;
    }
  }

  return true;
};

// 메모이제이션된 컴포넌트 내보내기
export default memo(ThreeObject, areEqual);
