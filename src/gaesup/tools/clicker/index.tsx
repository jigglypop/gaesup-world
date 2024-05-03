import { Line } from "@react-three/drei";
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
      {clickerOption.line &&
        clickerOption.queue.map((item, key) => {
          const current = key;
          const before = key === 0 ? clickerOption.queue.length - 1 : key - 1;
          return (
            <group position={[0, 1, 0]}>
              <Line
                worldUnits
                points={[
                  clickerOption.queue[before],
                  clickerOption.queue[current],
                ]}
                color="turquoise"
                transparent
                opacity={0.5}
                lineWidth={0.4}
              />

              <mesh key={key} position={item}>
                <sphereGeometry args={[0.6, 30, 0.6]} />
                <meshStandardMaterial
                  color="turquoise"
                  transparent
                  opacity={0.8}
                />
              </mesh>
            </group>
          );
        })}
    </>
  );
}
