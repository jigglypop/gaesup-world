// "Please use this only as a subcomponent of GaesupWorld."
import { useContext } from "react";
import { GaesupWorldContext } from "../../world/context";
export function useGaesupController() {
    var worldContext = useContext(GaesupWorldContext);
    return {
        state: worldContext.activeState,
        mode: worldContext.mode,
        urls: worldContext.urls,
        currentAnimation: worldContext.mode.type
            ? worldContext.animationState[worldContext.mode.type].current
            : "idle",
    };
}
