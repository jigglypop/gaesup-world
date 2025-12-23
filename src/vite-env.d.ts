/// <reference types="vite/client" />

type ThreeElements = import("@react-three/fiber").ThreeElements;

declare namespace JSX {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface IntrinsicElements extends ThreeElements {
    water: any;
  }
}

declare namespace React {
  namespace JSX {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface IntrinsicElements extends ThreeElements {
      water: any;
    }
  }
}

declare module '*.glsl' {
  const content: string;
  export default content;
}