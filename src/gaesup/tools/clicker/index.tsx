import { ReactNode, useContext } from "react";
import { GaesupWorldContext } from "../../world/context";

export function Clicker({ children }: { children?: ReactNode }) {
  const { clicker, mode } = useContext(GaesupWorldContext);
  return (
    <>
      {mode.controller === "clicker" && clicker.isOn && (
        <group position={clicker.point}>{children}</group>
      )}
    </>
  );
}
