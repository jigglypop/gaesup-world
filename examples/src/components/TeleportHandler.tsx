import { useTeleport, V3 } from '../../../src';
export function TeleportHandler() {
  const { teleport } = useTeleport();
  (window as any).teleportTo = (x: number, y: number, z: number) => {
    teleport(V3(x, y, z));
  };
  return null;
}
