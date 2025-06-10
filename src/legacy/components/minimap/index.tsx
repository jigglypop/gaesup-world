import useMeshQuery from "@store/mesh/query";
import { rotationAtom } from "@store/rotation/atom";
import { useTileParentQuery } from "@store/tileParent/query";
import { scDream } from "@styles/fonts.css";
import { GaesupWorldContext } from "gaesup-world";
import { useAtom } from "jotai";
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

function MiniMap() {
  const MINIMAP_SIZE = 200;
  const TILE_SIZE = 4;
  const CANVAS_TILE_SIZE = 20;

  const { meshes } = useMeshQuery();
  const { tilesByParentsId, tileParentMap } = useTileParentQuery();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { activeState } = useContext(GaesupWorldContext);
  const playerPosition = activeState?.position;
  const [rotate, setRotate] = useAtom(rotationAtom);
  const [turn, setTurn] = useState(false);

  const drawMiniMap = useCallback(() => {
    const canvas = canvasRef.current;
    if (
      !canvas ||
      !playerPosition ||
      !tilesByParentsId ||
      !meshes ||
      !tileParentMap
    )
      return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear the canvas
    ctx.clearRect(0, 0, MINIMAP_SIZE, MINIMAP_SIZE);

    // Save the canvas state
    ctx.save();

    // Move to center and rotate
    ctx.translate(MINIMAP_SIZE / 2, MINIMAP_SIZE / 2);
    ctx.rotate((Math.PI * 3) / 2 - rotate.default + rotate.angle);
    ctx.translate(-MINIMAP_SIZE / 2, -MINIMAP_SIZE / 2);

    // Create circular mask
    ctx.beginPath();
    ctx.arc(
      MINIMAP_SIZE / 2,
      MINIMAP_SIZE / 2,
      MINIMAP_SIZE / 2,
      0,
      Math.PI * 2
    );
    ctx.clip();

    // Fill background
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, MINIMAP_SIZE, MINIMAP_SIZE);

    // Calculate the offset to center the player
    const offsetX =
      MINIMAP_SIZE / 2 - playerPosition.x * (CANVAS_TILE_SIZE / TILE_SIZE);
    const offsetZ =
      MINIMAP_SIZE / 2 - playerPosition.z * (CANVAS_TILE_SIZE / TILE_SIZE);

    // Draw tiles
    Object.entries(tilesByParentsId).forEach(([parentId, tiles]) => {
      const mesh_id = tileParentMap[parentId]?.floor_mesh_id;
      if (!mesh_id) return;
      const mesh = meshes[mesh_id];
      const color = mesh?.color;
      ctx.fillStyle = color;
      let centerX = 0;
      let centerZ = 0;
      let tileCount = 0;
      tiles.forEach((tile) => {
        const x = tile.position[0] * (CANVAS_TILE_SIZE / TILE_SIZE) + offsetX;
        const z = tile.position[2] * (CANVAS_TILE_SIZE / TILE_SIZE) + offsetZ;
        ctx.fillRect(x, z, CANVAS_TILE_SIZE, CANVAS_TILE_SIZE);
        centerX += x;
        centerZ += z;
        tileCount++;
      });
      if (tileCount > 0) {
        centerX /= tileCount;
        centerZ /= tileCount;

        ctx.globalAlpha = 1;
        ctx.fillStyle = "white";
        ctx.font = `800 1.2rem ${scDream}`;
        ctx.textAlign = "center";
        ctx.fillText(
          tileParentMap[parentId]?.map_text || "",
          centerX + CANVAS_TILE_SIZE / 2,
          centerZ + CANVAS_TILE_SIZE / 2
        );
        ctx.globalAlpha = 0.5;
      }
    });

    // Draw player
    ctx.fillStyle = "#01fff7";
    ctx.beginPath();
    ctx.arc(MINIMAP_SIZE / 2, MINIMAP_SIZE / 2, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(0,0,0,0.2)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(
      MINIMAP_SIZE / 2,
      MINIMAP_SIZE / 2,
      MINIMAP_SIZE / 2 - 1,
      0,
      Math.PI * 2
    );
    ctx.stroke();
    ctx.restore();
  }, [tilesByParentsId, meshes, playerPosition, tileParentMap, rotate]);

  useEffect(() => {
    drawMiniMap();
  }, [drawMiniMap]);

  const calcAngle = useCallback(
    (x: number, y: number) => {
      if (!turn) return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = x - cx;
      const dy = y - cy;
      const angle = Math.atan2(dy, dx);
      setRotate((prev) => ({
        ...prev,
        angle: angle,
      }));
    },
    [setRotate, turn]
  );

  const handleMouseDown = () => setTurn(true);
  const handleMouseUp = () => setTurn(false);
  const handleMouseLeave = () => setTurn(false);
  const handleMouseMove = (e: React.MouseEvent) =>
    calcAngle(e.clientX, e.clientY);

  if (!tilesByParentsId || !meshes || !playerPosition) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      width={MINIMAP_SIZE}
      height={MINIMAP_SIZE}
      style={{
        position: "absolute",
        bottom: "20px",
        left: "20px",
        zIndex: 10000000,
        cursor: "pointer",
      }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    />
  );
}

export default MiniMap;
