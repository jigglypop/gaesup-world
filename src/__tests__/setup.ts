import '@testing-library/jest-dom';

// Canvas API Mock (JSDOM에서는 기본 제공되지 않음)
const mockCanvasContext = {
  fillRect: jest.fn(),
  clearRect: jest.fn(),
  getImageData: jest.fn(() => ({
    data: new Array(4).fill(0),
  })),
  putImageData: jest.fn(),
  createImageData: jest.fn(() => []),
  setTransform: jest.fn(),
  drawImage: jest.fn(),
  save: jest.fn(),
  restore: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  closePath: jest.fn(),
  stroke: jest.fn(),
  translate: jest.fn(),
  scale: jest.fn(),
  rotate: jest.fn(),
  arc: jest.fn(),
  fill: jest.fn(),
  measureText: jest.fn(() => ({ width: 0, height: 12 })),
  transform: jest.fn(),
  rect: jest.fn(),
  clip: jest.fn(),
  isPointInPath: jest.fn(() => false),
  isPointInStroke: jest.fn(() => false),
  getTransform: jest.fn(() => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 })),
  setLineDash: jest.fn(),
  getLineDash: jest.fn(() => []),
  createLinearGradient: jest.fn(() => ({
    addColorStop: jest.fn(),
  })),
  createRadialGradient: jest.fn(() => ({
    addColorStop: jest.fn(),
  })),
  createPattern: jest.fn(() => ({})),
  // Lottie가 필요로 하는 속성들
  get fillStyle() { return '#000000'; },
  set fillStyle(value) { /* mock setter */ },
  get strokeStyle() { return '#000000'; },
  set strokeStyle(value) { /* mock setter */ },
  get lineWidth() { return 1; },
  set lineWidth(value) { /* mock setter */ },
  get lineCap() { return 'butt'; },
  set lineCap(value) { /* mock setter */ },
  get lineJoin() { return 'miter'; },
  set lineJoin(value) { /* mock setter */ },
  get miterLimit() { return 10; },
  set miterLimit(value) { /* mock setter */ },
  get globalAlpha() { return 1; },
  set globalAlpha(value) { /* mock setter */ },
  get globalCompositeOperation() { return 'source-over'; },
  set globalCompositeOperation(value) { /* mock setter */ },
  get shadowBlur() { return 0; },
  set shadowBlur(value) { /* mock setter */ },
  get shadowColor() { return 'rgba(0, 0, 0, 0)'; },
  set shadowColor(value) { /* mock setter */ },
  get shadowOffsetX() { return 0; },
  set shadowOffsetX(value) { /* mock setter */ },
  get shadowOffsetY() { return 0; },
  set shadowOffsetY(value) { /* mock setter */ },
  get font() { return '10px sans-serif'; },
  set font(value) { /* mock setter */ },
  get textAlign() { return 'start'; },
  set textAlign(value) { /* mock setter */ },
  get textBaseline() { return 'alphabetic'; },
  set textBaseline(value) { /* mock setter */ },
  canvas: {
    width: 300,
    height: 150,
    style: {},
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  },
};

Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: jest.fn((contextType) => {
    if (contextType === '2d') {
      return mockCanvasContext;
    }
    if (contextType === 'webgl2' || contextType === 'webgl') {
      return {
        // WebGL 기본 메소드들 mock
        createProgram: jest.fn(),
        createShader: jest.fn(),
        shaderSource: jest.fn(),
        compileShader: jest.fn(),
        attachShader: jest.fn(),
        linkProgram: jest.fn(),
        useProgram: jest.fn(),
        createBuffer: jest.fn(),
        bindBuffer: jest.fn(),
        bufferData: jest.fn(),
        getAttribLocation: jest.fn(),
        enableVertexAttribArray: jest.fn(),
        vertexAttribPointer: jest.fn(),
        drawArrays: jest.fn(),
        clearColor: jest.fn(),
        clear: jest.fn(),
        viewport: jest.fn(),
        getParameter: jest.fn((param) => {
          if (param === 0x1F00) return 'Mock Vendor'; // VENDOR
          if (param === 0x1F01) return 'Mock Renderer'; // RENDERER
          if (param === 0x1F02) return 'Mock Version'; // VERSION
          if (param === 0x8B8C) return 32; // MAX_FRAGMENT_UNIFORM_VECTORS
          return null;
        }),
        getExtension: jest.fn(() => null),
        getSupportedExtensions: jest.fn(() => []),
        VERTEX_SHADER: 0x8B31,
        FRAGMENT_SHADER: 0x8B30,
        ARRAY_BUFFER: 0x8892,
        STATIC_DRAW: 0x88E4,
        COLOR_BUFFER_BIT: 0x00004000,
        DEPTH_BUFFER_BIT: 0x00000100,
      };
    }
    return null;
  }),
  writable: true,
});

// Window API mocks
Object.defineProperty(window, 'ResizeObserver', {
  value: jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  })),
  writable: true,
});

Object.defineProperty(window, 'requestAnimationFrame', {
  value: jest.fn((callback) => setTimeout(callback, 16)),
  writable: true,
});

Object.defineProperty(window, 'cancelAnimationFrame', {
  value: jest.fn(clearTimeout),
  writable: true,
});

// Media Query Mock
Object.defineProperty(window, 'matchMedia', {
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
  writable: true,
});

// Performance API Mock for memory measurements
Object.defineProperty(window.performance, 'memory', {
  value: {
    usedJSHeapSize: 1024 * 1024 * 10, // 10MB
    totalJSHeapSize: 1024 * 1024 * 50, // 50MB
    jsHeapSizeLimit: 1024 * 1024 * 100, // 100MB
  },
  writable: true,
});

// Global test utilities
(global as any).measureMemory = () => {
  if (window.performance.memory) {
    return {
      used: window.performance.memory.usedJSHeapSize,
      total: window.performance.memory.totalJSHeapSize,
      limit: window.performance.memory.jsHeapSizeLimit,
    };
  }
  return { used: 0, total: 0, limit: 0 };
};

// Mock console.warn to reduce noise in tests
const originalWarn = console.warn;
console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('three.js') ||
     args[0].includes('react-three-fiber') ||
     args[0].includes('WebGL'))
  ) {
    return;
  }
  originalWarn(...args);
};

export {}; 