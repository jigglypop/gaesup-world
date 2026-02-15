// Jest setup file for polyfills and global mocks
// Jest loads setupFilesAfterEnv via CommonJS; keep this file CJS-compatible.
// eslint-disable-next-line @typescript-eslint/no-require-imports
require("@testing-library/jest-dom");
// Decorator metadata used by boilerplate/decorators tests.
// eslint-disable-next-line @typescript-eslint/no-require-imports
require("reflect-metadata");

// React 18+ requires this flag to suppress "act environment" warnings.
// Some @react-three/fiber effects schedule updates on mount.
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// ResizeObserver polyfill for jsdom environment
global.ResizeObserver = class ResizeObserver {
  constructor(cb) {
    this.cb = cb;
  }
  observe() {
    this.cb([{ borderBoxSize: { inlineSize: 0, blockSize: 0 } }], this);
  }
  unobserve() {}
  disconnect() {}
};

// Canvas polyfill for Three.js in jsdom
if (!global.HTMLCanvasElement.prototype.getContext) {
  global.HTMLCanvasElement.prototype.getContext = () => ({
    fillRect: () => {},
    clearRect: () => {},
    getImageData: (x, y, w, h) => ({ data: new Array(w * h * 4) }),
    putImageData: () => {},
    createImageData: () => [],
    setTransform: () => {},
    drawImage: () => {},
    save: () => {},
    fillText: () => {},
    restore: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    closePath: () => {},
    stroke: () => {},
    translate: () => {},
    scale: () => {},
    rotate: () => {},
    arc: () => {},
    fill: () => {},
    measureText: () => ({ width: 0 }),
    transform: () => {},
    rect: () => {},
    clip: () => {},
  });
} 