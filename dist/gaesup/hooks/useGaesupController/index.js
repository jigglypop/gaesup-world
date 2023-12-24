// "Please use this only as a subcomponent of GaesupWorld."
import { useContext } from "react";
import { GaesupControllerContext } from "../../controller/context";
import { GaesupWorldContext } from "../../world/context";
export function useGaesupController() {
    var worldContext = useContext(GaesupWorldContext);
    var controllContext = useContext(GaesupControllerContext);
    return {
        state: worldContext.activeState,
        vehicleCollider: worldContext.vehicleCollider,
        characterCollider: worldContext.characterCollider,
        airplaneCollider: worldContext.airplaneCollider,
        wheelOffset: controllContext.vehicle.wheelOffset,
        mode: worldContext.mode,
        url: worldContext.url,
        currentAnimation: worldContext.animations.current,
    };
}
