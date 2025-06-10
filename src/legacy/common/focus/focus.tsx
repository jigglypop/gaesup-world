// import ThreeObject from "@common/threeObject";
// import { useFrame } from "@react-three/fiber";
// import { EffectComposer, Outline } from "@react-three/postprocessing";
// import { useRef, useState } from "react";
//
// export const FocusWrapper = (props) => {
//   const groupRef = useRef();
//   const [hovered, setHovered] = useState(false);
//
//   useFrame(() => {
//     if (groupRef.current) {
//       groupRef.current.traverse((child) => {
//         if (child.isMesh) {
//           child.material.color.setHex(hovered ? 0xffff00 : 0xffffff);
//         }
//       });
//     }
//   });
//
//   return (
//     <>
//       <group
//         ref={groupRef}
//         onPointerOver={() => setHovered(true)}
//         onPointerOut={() => setHovered(false)}>
//         <ThreeObject {...props} />
//       </group>
//       <EffectComposer>
//         <Outline
//           selection={groupRef}
//           visibleEdgeColor="white"
//           edgeStrength={hovered ? 10 : 0}
//           thickness={1}
//         />
//       </EffectComposer>
//     </>
//   );
// };
