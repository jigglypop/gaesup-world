import { CSSProperties } from "react";
import * as THREE from "three";
import { useTeleport } from "../../hooks/useTeleport";
import "./style.css";

export type JumpPortalType = {
  text?: string;
  position: THREE.Vector3;
  jumpPortalStyle?: CSSProperties;
};

/**
 * JumpPortal component represents a clickable portal that teleports the user to a specified location.
 *
 * @param {JumpPortalType} props - The props for the JumpPortal component.
 * @param {string} props.text - (Optional) The text to display on the portal.
 * @param {THREE.Vector3} props.position - The target position to teleport to.
 * @param {CSSProperties} props.jumpPortalStyle - (Optional) CSS styles for the JumpPortal component.
 */
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
