import { useTeleport, V3 } from '../../../src';
export function TeleportHandler() {
  const { Teleport } = useTeleport();
  (window as any).teleportTo = (x: number, y: number, z: number) => {
    Teleport(V3(x, y, z));
  };
  return null;
}
