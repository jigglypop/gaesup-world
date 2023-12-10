import initGaesupWorld from "../initial/initGaesupWorld";
import { initGaesupWorldPropsType } from "../initial/initGaesupWorld/type";
import {
  GaesupWorldContext,
  GaesupWorldDispatchContext,
} from "../stores/context";

export default function GaesupWorld(props: initGaesupWorldPropsType) {
  const { gaesupProps } = initGaesupWorld(props);
  return (
    <GaesupWorldContext.Provider value={gaesupProps.value}>
      <GaesupWorldDispatchContext.Provider value={gaesupProps.dispatch}>
        {props.children}
      </GaesupWorldDispatchContext.Provider>
    </GaesupWorldContext.Provider>
  );
}
