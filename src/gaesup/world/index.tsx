import { Leva } from "leva";
import { GaesupWorldContext, GaesupWorldDispatchContext } from "./context";
import initGaesupWorld from "./initalize";
import "./style.css";
import { gaesupWorldPropsType } from "./type";

export function GaesupWorld(props: gaesupWorldPropsType) {
  const { gaesupProps } = initGaesupWorld(props);
  return (
    <GaesupWorldContext.Provider value={gaesupProps.value}>
      <GaesupWorldDispatchContext.Provider value={gaesupProps.dispatch}>
        <Leva collapsed />
        {props.children}
      </GaesupWorldDispatchContext.Provider>
    </GaesupWorldContext.Provider>
  );
}
