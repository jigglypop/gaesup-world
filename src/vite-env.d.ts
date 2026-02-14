/// <reference types="vite/client" />

type ThreeElements = import("@react-three/fiber").ThreeElements;

declare namespace JSX {
  interface IntrinsicElements extends ThreeElements {
    water: Record<string, unknown>;
  }
}

declare namespace React {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {
      water: Record<string, unknown>;
    }
  }
}

declare module '*.glsl' {
  const content: string;
  export default content;
}