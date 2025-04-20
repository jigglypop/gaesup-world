// @testing-library/jest-dom 설정
require('@testing-library/jest-dom');

// Three.js 모킹
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
};

// WebGL 모킹
class WebGLRenderingContext {
  constructor() {
    this.canvas = {};
    this.drawingBufferWidth = 0;
    this.drawingBufferHeight = 0;
  }
  getExtension() {
    return null;
  }
  getParameter() {
    return 0;
  }
  getShaderPrecisionFormat() {
    return {
      precision: 0,
      rangeMin: 0,
      rangeMax: 0,
    };
  }
}

global.WebGLRenderingContext = WebGLRenderingContext;

// Three.js 캔버스 모킹
HTMLCanvasElement.prototype.getContext = function () {
  return new WebGLRenderingContext();
};

// 사용자 이벤트 모킹
global.PointerEvent = class PointerEvent {
  constructor(type, params = {}) {
    this.type = type;
    Object.assign(this, params);
  }
};

// 씬 객체 모킹
class DOMRect {
  constructor(x = 0, y = 0, width = 0, height = 0) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.top = y;
    this.right = x + width;
    this.bottom = y + height;
    this.left = x;
  }
}

Element.prototype.getBoundingClientRect = function () {
  return new DOMRect(0, 0, 1000, 1000);
};

// Mock window.matchMedia
global.matchMedia =
  global.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: () => {},
      removeListener: () => {},
    };
  };
