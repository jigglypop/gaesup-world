/// <reference types="vite/client" />
/// <reference types="@react-three/fiber" />
/// <reference types="three/examples/jsm/nodes/Nodes.js" />

import { ThreeElements } from '@react-three/fiber'

declare global {
    namespace React {
        namespace JSX {
            interface IntrinsicElements extends ThreeElements {
            }
        }
    }
}

declare module '*.glsl' {
  const content: string;
  export default content;
}