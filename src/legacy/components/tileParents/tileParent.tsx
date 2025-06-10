// import NameTag from "@common/spriteTag";
// import useTile from "@store/tile";
// import { useEffect, useMemo } from "react";
// import * as THREE from "three";
// import { tileParentsType } from "./type";
//
// export default function TileParent({
//   mesh,
//   tiles,
//   tileParent,
//   isUpdate,
// }: tileParentsType) {
//   const color = mesh?.color ?? "#ffffff";
//   const material = useMemo(
//     () =>
//       new THREE.MeshStandardMaterial({ transparent: true, opacity: 1, color }),
//     [color]
//   );
//
//   const { onTileDelete } = useTile();
//
//   const mergedGeometry = useMemo(() => {
//     const positions: number[] = [];
//     const indices: number[] = [];
//     let indexOffset = 0;
//
//     tiles.forEach((tile) => {
//       const geometry = new THREE.PlaneGeometry(4, 4);
//       const positionX = tile.position[0];
//       const positionZ = tile.position[2];
//       geometry.rotateX(-Math.PI / 2);
//       geometry.translate(positionX, -0.1, positionZ);
//       const vertexPositions = Array.from(
//         geometry.attributes.position.array as Float32Array
//       );
//       positions.push(...vertexPositions);
//       const vertexIndices = geometry.index
//         ? Array.from(geometry.index.array as Uint16Array)
//         : [];
//       indices.push(...vertexIndices.map((idx) => idx + indexOffset));
//       indexOffset += geometry.attributes.position.count;
//     });
//
//     const merged = new THREE.BufferGeometry();
//     merged.setAttribute(
//       "position",
//       new THREE.Float32BufferAttribute(positions, 3)
//     );
//     merged.setIndex(indices);
//     merged.computeVertexNormals();
//     return merged;
//   }, [tiles]);
//
//   useEffect(() => {
//     return () => {
//       if (mergedGeometry) mergedGeometry.dispose();
//       if (material) material.dispose();
//     };
//   }, [mergedGeometry, material]);
//   if (!mergedGeometry || !material) return null;
//   return (
//     <>
//       {isUpdate &&
//         tiles.map((tile, index) => {
//           const id = tile.id;
//           const tileParentId = tile.tile_parent_id;
//           if (!id || !tileParentId) return null;
//
//           return (
//             <group
//               key={index}
//               position={[
//                 tile.position[0],
//                 tile.position[1] + 2,
//                 tile.position[2],
//               ]}>
//               <NameTag
//                 text={"삭제"}
//                 background="rgba(10, 10, 10, 0.5)"
//                 fontSize={0.5}
//                 color={"rgba(223, 223, 223, 0.8)"}
//               />
//             </group>
//           );
//         })}
//       <mesh
//         key={tileParent.tile_parent_id}
//         castShadow
//         receiveShadow
//         geometry={mergedGeometry}
//         material={material}></mesh>
//     </>
//   );
// }
import NameTag from "@common/spriteTag";
import useMeshQuery from "@store/mesh/query";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { tileParentsType } from "./type";

export default function TileParent({
  tileParent,
  tiles,
  isUpdate,
}: tileParentsType) {
  const { meshes } = useMeshQuery();
  const materialRef = useRef<THREE.MeshStandardMaterial | null>(null);

  const textureLoader = new THREE.TextureLoader();

  // 기본 재질 (검정색)
  const defaultMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: 0x000000 }),
    []
  );

  // 재질 생성 함수
  const createMaterial = (meshId: string | null) => {
    if (!meshId) return defaultMaterial;
    const mesh = meshes?.[meshId];
    if (!mesh) return defaultMaterial;

    const baseOptions: THREE.MeshStandardMaterialParameters = {
      color: mesh.color || "#ffffff",
    };

    // Map 텍스처 로드
    if (mesh.map_texture_url) {
      baseOptions.map = textureLoader.load(mesh.map_texture_url, (texture) => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(0.5, 0.5);
        texture.needsUpdate = true;
        texture.flipY = false;
      });
    }

    // Normal 텍스처 로드
    if (mesh.normal_texture_url) {
      baseOptions.bumpMap = textureLoader.load(
        mesh.normal_texture_url,
        (texture) => {
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;
          texture.repeat.set(0.5, 0.5);
          texture.needsUpdate = true;
          texture.flipY = false;
        }
      );
    }

    return new THREE.MeshStandardMaterial(baseOptions);
  };

  const material = useMemo(() => {
    const newMaterial = createMaterial(tileParent.floor_mesh_id);
    materialRef.current = newMaterial;
    return newMaterial;
  }, [tileParent.floor_mesh_id]); // meshes를 의존성에서 제거

  const mergedGeometry = useMemo(() => {
    const positions: number[] = [];
    const indices: number[] = [];
    const uvs: number[] = [];
    let indexOffset = 0;

    tiles.forEach((tile) => {
      const geometry = new THREE.PlaneGeometry(4, 4);
      const positionX = tile.position[0];
      const positionZ = tile.position[2];
      geometry.rotateX(-Math.PI / 2);
      geometry.translate(positionX, -0.1, positionZ);

      // 위치 데이터 추가
      const vertexPositions = Array.from(
        geometry.attributes.position.array as Float32Array
      );
      positions.push(...vertexPositions);

      // 인덱스 데이터 추가
      const vertexIndices = geometry.index
        ? Array.from(geometry.index.array as Uint16Array)
        : [];
      indices.push(...vertexIndices.map((idx) => idx + indexOffset));

      // UV 좌표 생성 및 추가
      const tileUvs = [0, 0, 1, 0, 1, 1, 0, 1];
      uvs.push(...tileUvs);

      indexOffset += geometry.attributes.position.count;
    });

    const merged = new THREE.BufferGeometry();
    merged.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );
    merged.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    merged.setIndex(indices);
    merged.computeVertexNormals();
    return merged;
  }, [tiles]);

  useEffect(() => {
    return () => {
      if (mergedGeometry) mergedGeometry.dispose();
      if (material) material.dispose();
    };
  }, [mergedGeometry, material]);

  // 색상 변경 시 재질 업데이트
  useEffect(() => {
    if (materialRef.current && tileParent.floor_mesh_id) {
      const mesh = meshes?.[tileParent.floor_mesh_id];
      if (mesh) {
        materialRef.current.color.setStyle(mesh.color || "#ffffff");
        materialRef.current.needsUpdate = true;
      }
    }
  }, [meshes, tileParent.floor_mesh_id]);

  if (!mergedGeometry || !material) return null;

  return (
    <>
      {isUpdate &&
        tiles.map((tile, index) => {
          const id = tile.id;
          const tileParentId = tile.tile_parent_id;
          if (!id || !tileParentId) return null;

          return (
            <group
              key={index}
              position={[
                tile.position[0],
                tile.position[1] + 2,
                tile.position[2],
              ]}>
              <NameTag
                text={"삭제"}
                background="rgba(10, 10, 10, 0.5)"
                fontSize={0.5}
                color={"rgba(223, 223, 223, 0.8)"}
              />
            </group>
          );
        })}
      <mesh
        key={tileParent.tile_parent_id}
        castShadow
        receiveShadow
        geometry={mergedGeometry}
        material={material}
      />
    </>
  );
}
