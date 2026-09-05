import { readFileSync } from 'fs';
import path from 'path';

const readSource = (relativePath: string) =>
  readFileSync(path.join(process.cwd(), relativePath), 'utf8');

describe('mouse routing contracts', () => {
  it('keeps normal click-to-move separate from teleport clicks in the World example', () => {
    const worldSource = readSource('examples/pages/World.tsx');

    expect(worldSource).toContain('<GroundClicker />');
    expect(worldSource).toContain('<TeleportOnClick modifierKey="altKey" />');
    expect(worldSource).not.toContain('<TeleportOnClick modifierKey="none" />');
  });

  it('lets modified clicks pass through GroundClicker for tools such as teleport', () => {
    const groundClickerSource = readSource('src/core/interactions/components/GroundClicker/index.tsx');
    const modifierGuardIndex = groundClickerSource.indexOf('event.nativeEvent.altKey');
    const stopPropagationIndex = groundClickerSource.indexOf('event.stopPropagation()');

    expect(modifierGuardIndex).toBeGreaterThanOrEqual(0);
    expect(stopPropagationIndex).toBeGreaterThan(modifierGuardIndex);
  });

  it('does not mount a second camera mouse controller while building edit mode is active', () => {
    const controllerSource = readSource('src/core/building/components/BuildingController/index.tsx');

    expect(controllerSource).not.toContain('OrbitControls');
  });

  it('keeps TeleportOnClick raycastable when enabled', () => {
    const teleportSource = readSource('src/core/motions/ui/TeleportOnClick/index.tsx');

    expect(teleportSource).toContain('visible={enabled}');
    expect(teleportSource).toContain('depthWrite={false}');
    expect(teleportSource).toContain('colorWrite={false}');
    expect(teleportSource).not.toContain('visible={false}');
  });

  it('keeps transparent click planes out of the color and depth buffers', () => {
    const groundClickerSource = readSource('src/core/interactions/components/GroundClicker/index.tsx');
    const teleportSource = readSource('src/core/motions/ui/TeleportOnClick/index.tsx');

    expect(groundClickerSource).toContain('depthWrite={false}');
    expect(groundClickerSource).toContain('colorWrite={false}');
    expect(teleportSource).toContain('depthWrite={false}');
    expect(teleportSource).toContain('colorWrite={false}');
  });
});
