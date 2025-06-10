import { useThree } from "@react-three/fiber";
import useNpc from "@store/npc";
import usePortal from "@store/portal";
import useThreeObject from "@store/threeObject";
import useTile from "@store/tile";
import useUpdateRoom from "@store/update";
import useWall from "@store/wall";
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";

export default function HoverTiles() {
  const TILE_SIZE = 4;
  const GRID_SIZE = { x: 256, z: 120 };
  const TILE_ELEVATION = 0.05;
  const HOVER_TILE_ELEVATION = 0.1;
  const GRID_OFFSET = { x: 2, z: 2 };
  const { camera, raycaster } = useThree();
  const meshRef = useRef<THREE.Mesh>(null);
  const [hoveredTile, setHoveredTile] = useState<THREE.Vector3 | null>(null);

  const { setPosition, toggleOption, updateRoom } = useUpdateRoom();
  const { onWallCreate } = useWall();
  const { onTileCreate } = useTile();
  const { onPortalCreate } = usePortal();
  const { onThreeObjectCreate } = useThreeObject();
  const { onNpcCreate } = useNpc();

  const onClick = useCallback(
    (e: MouseEvent) => {
      if (
        e.target instanceof HTMLCanvasElement &&
        updateRoom.object_type !== "tile"
      ) {
        toggleOption();
      }
    },
    [updateRoom.object_type, toggleOption]
  );

  const onDoubleClick = useCallback(
    (e: MouseEvent) => {
      if (!(e.target instanceof HTMLCanvasElement)) return;
      switch (updateRoom.object_type) {
        case "tile":
          onTileCreate();
          break;
        case "normal":
          onThreeObjectCreate();
          break;
        case "wall":
          onWallCreate();
          break;
        case "npc":
          onNpcCreate();
          break;
        case "portal":
          onPortalCreate();
          break;
      }
    },
    [
      updateRoom.object_type,
      onTileCreate,
      onThreeObjectCreate,
      onWallCreate,
      onNpcCreate,
    ]
  );

  const updateHoveredTile = (e: MouseEvent) => {
    if (!(e.target instanceof HTMLCanvasElement)) return;
    const mouse = new THREE.Vector2(
      (e.clientX / window.innerWidth) * 2 - 1,
      -(e.clientY / window.innerHeight) * 2 + 1
    );
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(meshRef.current!);

    if (intersects.length > 0) {
      const { x, z } = intersects[0].point;
      const tileX =
        Math.floor((x - GRID_OFFSET.x) / TILE_SIZE) * TILE_SIZE +
        TILE_SIZE / 2 +
        GRID_OFFSET.x;
      const tileZ =
        Math.floor((z - GRID_OFFSET.z) / TILE_SIZE) * TILE_SIZE +
        TILE_SIZE / 2 +
        GRID_OFFSET.z;
      const newHoveredTile = new THREE.Vector3(
        tileX,
        HOVER_TILE_ELEVATION,
        tileZ
      );
      if (!hoveredTile || !newHoveredTile.equals(hoveredTile)) {
        setHoveredTile(newHoveredTile);
        setPosition({
          position: [newHoveredTile.x, TILE_ELEVATION, newHoveredTile.z],
        });
      }
    } else {
      setHoveredTile(null);
    }
  };
  useEffect(() => {
    window.addEventListener("pointermove", updateHoveredTile);
    window.addEventListener("click", onClick);
    window.addEventListener("dblclick", onDoubleClick);
    return () => {
      window.removeEventListener("pointermove", updateHoveredTile);
      window.removeEventListener("click", onClick);
      window.removeEventListener("dblclick", onDoubleClick);
    };
  }, [updateHoveredTile, onClick, onDoubleClick]);

  return (
    <>
      <mesh
        ref={meshRef}
        rotation-x={-Math.PI / 2}
        position={[GRID_OFFSET.x, TILE_ELEVATION, GRID_OFFSET.z]}>
        <planeGeometry args={[GRID_SIZE.x, GRID_SIZE.z]} />
        <meshBasicMaterial visible={false} />
      </mesh>
      {hoveredTile && (
        <mesh
          position={hoveredTile}
          rotation-x={-Math.PI / 2}>
          <planeGeometry args={[TILE_SIZE, TILE_SIZE]} />
          <meshBasicMaterial
            color="red"
            transparent
            opacity={0.5}
            depthWrite={false}
          />
        </mesh>
      )}
    </>
  );
}
