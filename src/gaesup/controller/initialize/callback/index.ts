import { controllerInnerType } from "../../type";

export default function initCallback(
  props: controllerInnerType,
  type: "character" | "vehicle" | "airplane"
) {
  //   const {
  //     characterGltf,
  //     animations: characterAnimations,
  //     activeState,
  //     states,
  //     control,
  //   } = useContext(GaesupWorldContext);
  //   const dispatch = useContext(GaesupWorldDispatchContext);
  //   const { animations } = characterGltf;
  //   const { actions } = useAnimations(animations, props.outerGroupRef);
  //   const { subscribe } = useGaesupAnimation({ type });
  //
  //   const playAnimation = (tag: keyof animationTagType, key: string) => {
  //     if (!(key in control)) return;
  //     if (control[key]) {
  //       characterAnimations.current = tag;
  //       dispatch({
  //         type: "update",
  //         payload: {
  //           animations: {
  //             ...characterAnimations,
  //           },
  //         },
  //       });
  //     }
  //   };
  //
  //   const controllerProp: callbackPropType = {
  //     ...props,
  //     activeState,
  //     control,
  //     states,
  //     subscribe,
  //   };
  //
  //   useEffect(() => {
  //     if (props.onReady) {
  //       props.onReady(controllerProp);
  //     }
  //     return () => {
  //       if (props.onDestory) {
  //         props.onDestory(controllerProp);
  //       }
  //     };
  //   }, []);
  //
  //   useFrame((prop) => {
  //     if (props.onFrame) {
  //       props.onFrame({ ...controllerProp, ...prop });
  //     }
  //     if (props.onAnimate) {
  //       props.onAnimate({
  //         ...controllerProp,
  //         ...prop,
  //         actions,
  //         animation: characterAnimations,
  //         playAnimation,
  //       });
  //     }
  //   });
}
