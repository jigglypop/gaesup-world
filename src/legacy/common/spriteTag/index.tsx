import { useThree } from "@react-three/fiber";
import { n3 } from "@store/npc/type";
import { scDream } from "@styles/fonts.css";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { roundRect } from "./roundRec";
import { INameTag, NameTagProps } from "./type";

const createTexture = ({
  text,
  textLength,
  width,
  height,
  fontSize,
  background,
  borderColor,
  color,
  fontFamily,
  fontWeight,
}: NameTagProps) => {
  const canvas = document.createElement("canvas");
  const l = textLength || text.length;
  const size = fontSize ? fontSize * 200 : 1000;
  const roundSize = fontSize ? fontSize * 100 : 500;
  canvas.width = width || size * l * 0.7;
  canvas.height = height || size;
  const context = canvas.getContext("2d");
  if (context) {
    // 배경 그리기
    context.fillStyle = background;
    roundRect(context, 0, 0, canvas.width, canvas.height, roundSize);
    context.fill();
    // 테두리 그리기
    context.strokeStyle = borderColor || background;
    context.lineWidth = 2;
    roundRect(context, 0, 0, canvas.width, canvas.height, roundSize);
    context.stroke();
    // 텍스트 그리기
    context.font = `${fontWeight || "800"} 
    ${fontSize ? fontSize * 10 : "10"}rem ${fontFamily || scDream}`;
    context.fillStyle = color || "rgba(255, 255, 255, 0.8)";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(text, canvas.width / 2, canvas.height / 2);
  }
  const texture = new THREE.CanvasTexture(canvas);

  // 텍스처 래핑 모드 설정
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;

  // 텍스처 필터링 설정
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  return texture;
};

const NameTag: INameTag = (props) => {
  const spriteRef = useRef<THREE.Sprite>(null);
  const { raycaster, gl } = useThree();

  const texture = useMemo(() => createTexture(props), [props.text]);
  const spriteMaterial = useMemo(() => {
    return new THREE.SpriteMaterial({ map: texture });
  }, [texture]);

  useEffect(() => {
    const canvas = gl.domElement;
    const checkHover = () => {
      if (spriteRef.current) {
        const intersects = raycaster.intersectObject(spriteRef.current);
        canvas.style.cursor = intersects.length > 0 ? "pointer" : "default";
      }
    };

    window.addEventListener("mousemove", checkHover);
    return () => {
      window.removeEventListener("mousemove", checkHover);
      canvas.style.cursor = "default";
    };
  }, [raycaster, gl]);

  const calcScale = (): n3 => {
    if (props.text) {
      const l = props.textLength || props.text.length;
      if (props.fontSize) {
        const size = props.fontSize;
        return [l * size * 0.7, size, l * size];
      } else {
        return [l, 1, l * 0.7];
      }
    }
    return [1, 1, 1];
  };

  return (
    <group scale={calcScale()}>
      <sprite
        ref={spriteRef}
        material={spriteMaterial}>
        {props.children}
      </sprite>
    </group>
  );
};

export default NameTag;
