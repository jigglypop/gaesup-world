import { MiniMap } from "../tools/minimap";
import { GaesupWorldContext, GaesupWorldDispatchContext } from "./context";
import initGaesupWorld from "./initalize";
import { gaesupWorldPropsType } from "./type";

export function GaesupWorld(props: gaesupWorldPropsType) {
  const { gaesupProps } = initGaesupWorld(props);
  return (
    <GaesupWorldContext.Provider value={gaesupProps.value}>
      <GaesupWorldDispatchContext.Provider value={gaesupProps.dispatch}>
        {props.children}
        <MiniMap />
      </GaesupWorldDispatchContext.Provider>
    </GaesupWorldContext.Provider>
  );
}
