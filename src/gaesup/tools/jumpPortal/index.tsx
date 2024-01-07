import { useTeleport } from "../../hooks/useTeleport";
import { portalType } from "../../world/context/type";
import "./style.css";

export function JumpPortal({ text, position, jumpPortalStlye }: portalType) {
  const { Teleport } = useTeleport();

  return (
    <div
      className="jumpPortal"
      onClick={() => {
        Teleport(position);
      }}
      style={jumpPortalStlye}
    >
      {text}
    </div>
  );
}
