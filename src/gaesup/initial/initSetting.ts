import { propType } from "@gaesup/type";

/**
 * Follow camera initial setups from props
 * Load camera pivot and character move preset
 * 카메라 초기 설정
 * 카메라 피벗과 캐릭터 이동 설정
 */
export default function initSetting(prop: propType) {
  // const options = useAtomValue(optionsAtom);
  // const { camera } = useThree();
  // const { constant, cameraRay } = prop;
  // useEffect(() => {
  //   // Initialize camera facing direction
  //   if (options.camera.type === "perspective") {
  //     const origin = new THREE.Object3D();
  //     origin.position.set(0, 0, constant.cameraInitDirection);
  //     cameraRay.followCamera = origin;
  //     camera.position.set(0, 0, 0);
  //   }
  // }, [options.camera.type, options.camera.control]);
}
