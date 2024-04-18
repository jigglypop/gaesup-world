import { useFrame } from "@react-three/fiber";
import normal, { makeNormalCameraPosition } from "./control/normal";
import orbit from "./control/orbit";
export default function Camera(prop) {
    // const worldContext = useContext(GaesupWorldContext);
    // const controllerContext = useContext(GaesupControllerContext);
    // const { mode, cameraOption, activeState } = worldContext;
    // const cameraRef = useRef<CameraControls>();
    // const intersectObjectMap: intersectObjectMapType = useMemo(() => ({}), []);
    // const cameraProp: cameraPropType = {
    //   ...prop,
    //   // control,
    //   controllerContext,
    //   worldContext,
    //   // intersectObjectMap,
    // };
    // cameraProp.cameraRay.rayCast = new THREE.Raycaster(
    //   cameraProp.cameraRay.origin,
    //   cameraProp.cameraRay.dir,
    //   0,
    //   -cameraOption.maxDistance
    // );
    useFrame(function (state, delta) {
        // if (
        //   !rigidBodyRef ||
        //   !rigidBodyRef.current ||
        //   !outerGroupRef ||
        //   !outerGroupRef.current
        // )
        //   return;
        // cameraProp.delta = delta;
        prop.state = state;
        if (!prop.worldContext.block.camera) {
            if (prop.worldContext.mode.control === "orbit") {
                orbit(prop);
            }
            else if (prop.worldContext.mode.control === "normal") {
                normal(prop);
            }
        }
    });
    // zoom
    // useEffect(() => {
    //   if (cameraRef.current) {
    //     cameraRef.current.zoomTo(worldContext.cameraOption.zoom, true);
    //   }
    // }, [worldContext.cameraOption.zoom]);
    // 포커스가 아닐 때 카메라 activeStae 따라가기
    useFrame(function () {
        if (!prop.worldContext.cameraOption.focus) {
            prop.worldContext.cameraOption.target =
                prop.worldContext.activeState.position;
            prop.worldContext.cameraOption.position = makeNormalCameraPosition(prop.worldContext.activeState, prop.worldContext.cameraOption);
        }
    });
}
