// import { useContext, useState } from "react";
// import * as THREE from "three";
// import { makeNormalCameraPosition } from "../../camera/control/normal";
// import { makeOrbitCameraPosition } from "../../camera/control/orbit";
// import {
//   GaesupWorldContext,
//   GaesupWorldDispatchContext,
// } from "../../world/context/index";
// import "./style.css";
//
// export type zoomButtonPropsType = {
//   children?: React.ReactNode;
//   position: THREE.Vector3;
//   target?: THREE.Vector3;
//   keepBlocking?: boolean;
//   zoomButtonStyle?: React.CSSProperties;
// };
//
// export function useZoom() {
//   const { moveTo, activeState, cameraOption, mode, block } =
//     useContext(GaesupWorldContext);
//   const dispatch = useContext(GaesupWorldDispatchContext);
//   const [isZoom, setIsZoom] = useState(true);
//
//   const closeCamera = async (position: THREE.Vector3) => {
//     cameraOption.XDistance = position.x;
//     cameraOption.YDistance = position.y;
//     cameraOption.ZDistance = position.z;
//     block.camera = true;
//     dispatch({
//       type: "update",
//       payload: {
//         block: {
//           ...block,
//         },
//         cameraOption: {
//           ...cameraOption,
//         },
//       },
//     });
//   };
//
//   const openCamera = async () => {
//     block.camera = false;
//     dispatch({
//       type: "update",
//       payload: {
//         block: {
//           ...block,
//         },
//       },
//     });
//   };
//
//   const moveToCamera = async () => {
//     if (mode.control === "orbit" && moveTo) {
//       await moveTo(
//         makeOrbitCameraPosition(activeState, cameraOption),
//         activeState.position
//       );
//     } else if (mode.control === "normal" && moveTo) {
//       await moveTo(
//         makeNormalCameraPosition(activeState, cameraOption),
//         activeState.position
//       );
//     }
//   };
//
//   const setZoom = async (position: THREE.Vector3, isZoom: boolean) => {
//     setIsZoom(isZoom);
//     await closeCamera(position);
//     await moveToCamera();
//     await openCamera();
//   };
//
//   return {
//     setZoom,
//     openCamera,
//     closeCamera,
//     isZoom,
//     setIsZoom,
//     moveToCamera,
//   };
// }
//
// export function ZoomButton(props: zoomButtonPropsType) {
//   const { setZoom, isZoom } = useZoom();
//
//   return (
//     <div
//       className="zoomButton"
//       style={{
//         ...props.zoomButtonStyle,
//       }}
//       onClick={async () => {
//         await setZoom(props.position, isZoom);
//       }}
//     >
//       {props.children}
//     </div>
//   );
// }
