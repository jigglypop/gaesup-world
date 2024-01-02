// "Please use this only as a subcomponent of GaesupWorld."
import { useContext } from "react";
import { GaesupWorldContext } from "../../world/context";
export function useGaesupController() {
    var worldContext = useContext(GaesupWorldContext);
    return {
        state: worldContext.activeState,
        vehicleCollider: worldContext.vehicleCollider,
        characterCollider: worldContext.characterCollider,
        airplaneCollider: worldContext.airplaneCollider,
        mode: worldContext.mode,
        url: worldContext.url,
        currentAnimation: worldContext.animations.current,
        cameraState: worldContext.cameraState,
    };
}
