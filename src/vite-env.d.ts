/// <reference types="vite/client" />

type ThreeElements = import("@react-three/fiber").ThreeElements;
type WaterElementProps = Record<string, object | string | number | boolean | bigint | symbol | null | undefined>;

// Custom env vars used by this repo (keeps `noPropertyAccessFromIndexSignature` happy).
interface ImportMetaEnv {
  readonly VITE_SERVER_URL?: string;
  readonly VITE_RL_POLICY_ENDPOINT?: string;
}

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV?: 'development' | 'production' | 'test';
    VITE_ENABLE_BRIDGE_LOGS?: string;
  }
}

declare namespace JSX {
  interface IntrinsicElements extends ThreeElements {
    water: WaterElementProps;
  }
}

declare namespace React {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {
      water: WaterElementProps;
    }
  }
}

declare module '*.glsl' {
  const content: string;
  export default content;
}
