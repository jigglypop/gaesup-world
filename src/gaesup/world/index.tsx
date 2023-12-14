import initGaesupWorld from "../initial/gaesupWorld";
import { initGaesupWorldPropsType } from "../initial/gaesupWorld/type";
import { GaesupWorldContext, GaesupWorldDispatchContext } from "./context";

export function GaesupWorld(props: initGaesupWorldPropsType) {
  const { gaesupProps } = initGaesupWorld(props);
  return (
    <GaesupWorldContext.Provider value={gaesupProps.value}>
      <GaesupWorldDispatchContext.Provider value={gaesupProps.dispatch}>
        {props.children}
      </GaesupWorldDispatchContext.Provider>
    </GaesupWorldContext.Provider>
  );
}
