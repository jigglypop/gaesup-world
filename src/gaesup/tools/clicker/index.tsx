import { ReactNode, useContext } from "react";
import { GaesupWorldContext } from "../../world/context";

export function Clicker({
  onMarker,
  runMarker,
}: {
  onMarker: ReactNode;
  runMarker: ReactNode;
}) {
  const { clicker, mode, clickerOption } = useContext(GaesupWorldContext);
  return (
    <>
      {mode.controller === "clicker" && (
        <group position={clicker.point}>
          {clicker.isOn && onMarker}
          {clicker.isOn && clickerOption.isRun && clicker.isRun && runMarker}
        </group>
      )}
    </>
  );
}
