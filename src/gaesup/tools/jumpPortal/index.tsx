import { CSSProperties } from "react";
import * as THREE from "three";
import { useTeleport } from "../../hooks/useTeleport";
import "./style.css";

export type JumpPortalType = {
  text?: string;
  position: THREE.Vector3;
  jumpPortalStyle?: CSSProperties;
};

export function JumpPortal({
  text,
  position,
  jumpPortalStyle,
}: JumpPortalType) {
  const { Teleport } = useTeleport();

  return (
    <div
      className="jumpPortal"
      onClick={() => {
        Teleport(position);
      }}
      style={jumpPortalStyle}
    >
      {text}
    </div>
  );
}
