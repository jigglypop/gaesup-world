import { useTeleport, V3 } from '../../src';
export function TeleportHandler() {
  const { teleport } = useTeleport();
  (window as any).teleportTo = async (x: number, y: number, z: number) => {
    const success = await teleport(V3(x, y, z));
    if (!success) {
      console.warn(`Failed to teleport to (${x}, ${y}, ${z})`);
    }
  };
  return null;
}
