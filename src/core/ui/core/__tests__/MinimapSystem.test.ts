import { Vector3 } from 'three';

import { MinimapSystem } from '../MinimapSystem';

test('canvas state work stays constant as visible tile count grows', () => {
  const system = new MinimapSystem();
  const context = document.createElement('canvas').getContext('2d')!;
  const save = jest.spyOn(context, 'save');
  const restore = jest.spyOn(context, 'restore');
  const stroke = jest.spyOn(context, 'strokeRect');
  const options = { size: 200, scale: 5, position: new Vector3(), rotation: 0 };
  try {
    system.setCanvas(context.canvas);
    system.render({ ...options, tileGroups: new Map([['one', { tiles: [{ position: { x: 0, y: 0, z: 0 } }] }]]) });
    const savesPerPass = save.mock.calls.length;
    const restoresPerPass = restore.mock.calls.length;
    save.mockClear();
    restore.mockClear();
    stroke.mockClear();
    const tiles = Array.from({ length: 1000 }, (_, index) => ({ position: { x: index % 10, y: 0, z: 0 }, objectType: 'grass' }));
    system.render({ ...options, tileGroups: new Map([['many', { tiles }]]) });
    expect(stroke).toHaveBeenCalledTimes(1000);
    expect(save).toHaveBeenCalledTimes(savesPerPass);
    expect(restore).toHaveBeenCalledTimes(restoresPerPass);
    expect(context.lineWidth).toBe(1);
    expect(context.getTransform().isIdentity).toBe(true);
  } finally {
    system.dispose();
    jest.restoreAllMocks();
  }
});

test('skips distant tiles while retaining edge intersections at any map rotation', () => {
  const system = new MinimapSystem();
  const context = document.createElement('canvas').getContext('2d')!;
  const stroke = jest.spyOn(context, 'strokeRect');
  const tiles = Array.from({ length: 10_000 }, (_, index) => ({
    position: { x: 1000 + index, y: 0, z: 1000 }, size: 1,
  }));
  tiles.push(
    { position: { x: 0, y: 0, z: 0 }, size: 1 },
    { position: { x: 21, y: 0, z: 0 }, size: 1 },
    { position: { x: 21, y: 0, z: 21 }, size: 1 },
    { position: { x: 30, y: 0, z: 0 }, size: 10 },
  );
  const options = {
    size: 200, scale: 5, position: new Vector3(), rotation: 0,
    tileGroups: new Map([['world', { tiles }]]),
  };
  try {
    system.setCanvas(context.canvas);
    for (const rotation of [0, Math.PI / 4, Math.PI / 2]) {
      system.checkForUpdates(options.position, rotation);
      system.render({ ...options, rotation });
      expect(stroke.mock.calls).toEqual([
        [90, 90, 20, 20],
        [-15, 90, 20, 20],
        [-150, 0, 200, 200],
      ]);
      stroke.mockClear();
    }
    options.position.set(1000, 0, 1000);
    system.checkForUpdates(options.position, 0);
    system.render(options);
    expect(stroke).toHaveBeenCalledWith(90, 90, 20, 20);
    expect(stroke).not.toHaveBeenCalledWith(-150, 0, 200, 200);
    expect(stroke.mock.calls.length).toBeLessThan(30);
  } finally {
    system.dispose();
    jest.restoreAllMocks();
  }
});

test('locks the map rotation, redraws on toggles and keeps marker labels upright', () => {
  const system = new MinimapSystem();
  const context = document.createElement('canvas').getContext('2d')!;
  const clear = jest.spyOn(context, 'clearRect');
  const rotate = jest.spyOn(context, 'rotate');
  const labelTransforms: DOMMatrix[] = [];
  jest.spyOn(context, 'fillText').mockImplementation((text) => {
    if (text === '집') labelTransforms.push(context.getTransform());
  });
  const options = { size: 200, scale: 5, position: new Vector3(), rotation: Math.PI / 3 };
  try {
    system.setCanvas(context.canvas);
    system.addMarker('home', 'normal', '집', new Vector3(2, 0, 3), new Vector3(1, 1, 1));
    system.render(options);
    expect(rotate.mock.calls[0]?.[0]).toBeCloseTo(-options.rotation);
    clear.mockClear();
    rotate.mockClear();
    system.render({ ...options, blockRotate: true });
    expect(clear).toHaveBeenCalledTimes(1);
    expect(rotate.mock.calls.every(([angle]) => angle === 0)).toBe(true);
    system.render({ ...options, blockRotate: true });
    expect(clear).toHaveBeenCalledTimes(1);
    rotate.mockClear();
    system.render(options);
    expect(clear).toHaveBeenCalledTimes(2);
    expect(rotate.mock.calls[0]?.[0]).toBeCloseTo(-options.rotation);
    expect(labelTransforms).toHaveLength(3);
    for (const transform of labelTransforms) {
      expect(transform.a).toBeCloseTo(1);
      expect(transform.b).toBeCloseTo(0);
      expect(transform.c).toBeCloseTo(0);
      expect(transform.d).toBeCloseTo(1);
    }
  } finally {
    system.dispose();
    jest.restoreAllMocks();
  }
});

test('rebuilds gradients on size changes and caches subsequent stationary renders', () => {
  const system = new MinimapSystem();
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d')!;
  const gradient = jest.spyOn(context, 'createRadialGradient');
  const clear = jest.spyOn(context, 'clearRect');
  const options = { size: 200, scale: 5, position: new Vector3(), rotation: 0 };
  try {
    system.setCanvas(canvas);
    system.render(options);
    gradient.mockClear();
    clear.mockClear();
    system.render({ ...options, size: 300 });
    expect(clear).toHaveBeenCalledTimes(1);
    expect(clear).toHaveBeenCalledWith(0, 0, 300, 300);
    expect(gradient).toHaveBeenCalledTimes(2);
    expect(gradient).toHaveBeenCalledWith(150, 150, 0, 150, 150, 150);
    expect(gradient).toHaveBeenCalledWith(150, 150, 0, 150, 150, 12);
    system.render({ ...options, size: 300 });
    expect(clear).toHaveBeenCalledTimes(1);
    expect(gradient).toHaveBeenCalledTimes(2);
  } finally {
    system.dispose();
    jest.restoreAllMocks();
  }
});

test('redraws stationary building and marker edits while caching unchanged frames', () => {
  const system = new MinimapSystem();
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d')!;
  const clear = jest.spyOn(context, 'clearRect');
  const text = jest.spyOn(context, 'fillText');
  const options = { size: 200, scale: 5, position: new Vector3(), rotation: 0 };
  try {
    system.setCanvas(canvas);
    system.render(options);
    clear.mockClear();
    system.render(options);
    expect(clear).not.toHaveBeenCalled();
    const tileGroups = new Map([['plot', { tiles: [{ position: { x: 2, y: 0, z: 0 }, size: 1 }] }]]);
    system.render({ ...options, tileGroups });
    expect(clear).toHaveBeenCalledTimes(1);
    system.render({ ...options, tileGroups });
    expect(clear).toHaveBeenCalledTimes(1);
    const emptyGroups: typeof tileGroups = new Map();
    system.render({ ...options, tileGroups: emptyGroups });
    expect(clear).toHaveBeenCalledTimes(2);

    system.addMarker('home', 'normal', '집', new Vector3(), new Vector3(1, 1, 1));
    system.render({ ...options, tileGroups: emptyGroups });
    expect(clear).toHaveBeenCalledTimes(3);
    expect(text).toHaveBeenCalledWith('집', 0, 0);
    system.updateMarker('home', { text: '새 집' });
    system.render({ ...options, tileGroups: emptyGroups });
    expect(clear).toHaveBeenCalledTimes(4);
    expect(text).toHaveBeenCalledWith('새 집', 0, 0);
    system.removeMarker('home');
    text.mockClear();
    system.render({ ...options, tileGroups: emptyGroups });
    expect(clear).toHaveBeenCalledTimes(5);
    expect(text).not.toHaveBeenCalledWith('새 집', 0, 0);
  } finally {
    system.dispose();
    jest.restoreAllMocks();
  }
});
