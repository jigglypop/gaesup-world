import { TRAIL, TrailField } from '../trail';

describe('TrailField', () => {
  it('centers on the player and presses a print only inside its window', () => {
    const field = new TrailField();
    field.follow(10, -6);
    expect(Math.abs(field.center.x - 10)).toBeLessThan(field.texel);
    expect(Math.abs(field.center.y + 6)).toBeLessThan(field.texel);
    field.dirty = false;
    field.stamp(10, -6, 0);
    expect(field.dirty).toBe(true);
    expect(field.depthAt(10, -6)).toBeGreaterThan(0.9);
    // Along the heading the print is longer than across it.
    expect(field.depthAt(10.08, -6)).toBeGreaterThan(0);
    expect(field.depthAt(10, -5.92)).toBe(0);
    field.stamp(10 + TRAIL.size, -6, 0);
    expect(field.depthAt(10 + TRAIL.size, -6)).toBe(0);
  });

  it('keeps prints while the window scrolls past them and clears the texels it scrolls onto', () => {
    const field = new TrailField();
    field.follow(0, 0);
    field.stamp(2, 0, 0);
    field.stamp(-TRAIL.size / 2 + 0.5, 0, 0);
    field.follow(TRAIL.recenter + 1, 0);
    expect(field.depthAt(2, 0)).toBeGreaterThan(0.9);
    // The print left behind is outside the window, and the texels it used now start empty on the far side.
    expect(field.depthAt(-TRAIL.size / 2 + 0.5, 0)).toBe(0);
    expect(field.depthAt(TRAIL.size / 2 + 0.5, 0)).toBe(0);
    field.follow(1000, 1000);
    expect(field.depthAt(2, 0)).toBe(0);
  });

  it('fades prints out and reports when none is left', () => {
    const field = new TrailField();
    field.follow(0, 0);
    field.stamp(0, 0, 1.2);
    const before = field.depthAt(0, 0);
    expect(field.fade(100)).toBe(true);
    expect(field.depthAt(0, 0)).toBeCloseTo(before - 100 / 255, 5);
    expect(field.fade(255)).toBe(true);
    expect(field.fade(1)).toBe(false);
  });
});
