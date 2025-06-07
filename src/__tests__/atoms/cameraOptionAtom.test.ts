import { createStore } from 'jotai';
import { cameraOptionAtom } from '@/gaesup/atoms/cameraOptionAtom';
import { V3 } from '@/gaesup/utils/vector';

describe('cameraOptionAtom', () => {
  it('should have correct initial state', () => {
    const store = createStore();
    const options = store.get(cameraOptionAtom);

    expect(options.offset).toEqual(V3(-10, -10, -10));
    expect(options.maxDistance).toBe(-7);
    expect(options.fov).toBe(75);
    expect(options.focus).toBe(false);
    expect(options.enableCollision).toBe(true);
  });
});
