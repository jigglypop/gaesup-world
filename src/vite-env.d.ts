/// <reference types="vite/client" />

type ThreeElements = import("@react-three/fiber").ThreeElements;

// Custom env vars used by this repo (keeps `noPropertyAccessFromIndexSignature` happy).
interface ImportMetaEnv {
  readonly VITE_SERVER_URL?: string;
}

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV?: 'development' | 'production' | 'test';
    VITE_ENABLE_BRIDGE_LOGS?: string;
  }
}

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