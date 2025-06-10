import { useThree } from "@react-three/fiber";
import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { DeleteTagComponent } from "./type";

const createTexture = (isHovered: boolean) => {
  const canvas = document.createElement("canvas");
  canvas.width = 78;
  canvas.height = 78;
  const context = canvas.getContext("2d");
  if (context) {
    context.shadowColor = "rgba(0, 0, 0, 0.5)";
    context.shadowBlur = 4;
    context.shadowOffsetX = 2;
    context.shadowOffsetY = 2;

    const gradient = context.createRadialGradient(39, 39, 0, 39, 39, 39);
    gradient.addColorStop(0, isHovered ? "#1e1e1e" : "#0c0c0c");
    gradient.addColorStop(1, isHovered ? "#232323" : "#000000");

    context.beginPath();
    context.arc(39, 39, 35, 0, Math.PI * 2);
    context.fillStyle = gradient;
    context.fill();

    context.strokeStyle = "white";
    context.lineWidth = 4;
    context.beginPath();
    context.moveTo(24, 24);
    context.lineTo(54, 54);
    context.moveTo(54, 24);
    context.lineTo(24, 54);
    context.stroke();
  }
  return new THREE.CanvasTexture(canvas);
};

const DeleteTag: DeleteTagComponent = React.memo(
  ({ onClick, position, scale }) => {
    const s = 0.5;
    const [hovered, setHovered] = useState(false);
    const spriteRef = useRef<THREE.Sprite>(null);
    const { raycaster, gl } = useThree();

    const normalTexture = useMemo(() => createTexture(false), []);
    const hoverTexture = useMemo(() => createTexture(true), []);

    const spriteMaterial = useMemo(() => {
      return new THREE.SpriteMaterial({
        map: hovered ? hoverTexture : normalTexture,
      });
    }, [hovered, normalTexture, hoverTexture]);

    useEffect(() => {
      const canvas = gl.domElement;
      let hoveredSprite: THREE.Sprite | null = null;

      const checkHover = () => {
        if (spriteRef.current) {
          const intersects = raycaster.intersectObject(spriteRef.current);
          const isHovered = intersects.length > 0;
          setHovered(isHovered);

          if (isHovered && hoveredSprite !== spriteRef.current) {
            canvas.style.cursor = "pointer";
            hoveredSprite = spriteRef.current;
          } else if (!isHovered && hoveredSprite === spriteRef.current) {
            canvas.style.cursor = "default";
            hoveredSprite = null;
          }
        }
      };

      window.addEventListener("mousemove", checkHover);
      return () => {
        window.removeEventListener("mousemove", checkHover);
        if (hoveredSprite === spriteRef.current) {
          canvas.style.cursor = "default";
        }
      };
    }, [raycaster, gl]);

    return (
      <sprite
        ref={spriteRef}
        position={position}
        scale={scale ? [s / scale[0], s / scale[1], s / scale[2]] : [s, s, s]}
        material={spriteMaterial}
        onClick={onClick}
      />
    );
  }
);

export default DeleteTag;
