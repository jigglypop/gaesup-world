import { useRef } from 'react';

import type { RapierRigidBody } from '@react-three/rapier';
import ReactThreeTestRenderer from '@react-three/test-renderer';

import { useWorldPhysicsInterpolation, WorldPhysicsContext, type WorldPhysicsClock } from '../physicsContext';
import { PhysicsPresentation } from '../PhysicsPresentation';

const read = jest.fn(() => ({ x: 0, y: 0, z: 0, w: 1 }));
const body = { translation: read, rotation: read, isValid: () => true } as unknown as RapierRigidBody;

function Visual({ fixed }: { fixed: boolean }) {
  const bodyRef = useRef<RapierRigidBody | null>(body);
  const visual = useWorldPhysicsInterpolation(bodyRef, undefined, fixed);
  return <group ref={visual} />;
}

test('a fixed body costs no Rapier reads per tick; a moving body is read before and after each step', async () => {
  const presentation = new PhysicsPresentation();
  const renderer = await ReactThreeTestRenderer.create(
    <WorldPhysicsContext.Provider value={{ presentation } as unknown as WorldPhysicsClock}>
      <Visual fixed />
      <Visual fixed />
      <Visual fixed />
      <Visual fixed={false} />
    </WorldPhysicsContext.Provider>,
  );
  try {
    read.mockClear();
    presentation.beforeStep();
    presentation.afterStep();
    // translation and rotation of the one moving body, before and after the step
    expect(read).toHaveBeenCalledTimes(4);
  } finally {
    await renderer.unmount();
  }
});
