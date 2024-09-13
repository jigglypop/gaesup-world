import { useContext } from "react";
import { GaesupWorldContext } from "../../world/context";
export function useTeleport() {
    const worldContext = useContext(GaesupWorldContext);
    const Teleport = (position) => {
        var _a, _b, _c;
        if (worldContext &&
            (worldContext === null || worldContext === void 0 ? void 0 : worldContext.refs) &&
            ((_a = worldContext === null || worldContext === void 0 ? void 0 : worldContext.refs) === null || _a === void 0 ? void 0 : _a.rigidBodyRef) &&
            ((_c = (_b = worldContext === null || worldContext === void 0 ? void 0 : worldContext.refs) === null || _b === void 0 ? void 0 : _b.rigidBodyRef) === null || _c === void 0 ? void 0 : _c.current))
            worldContext.refs.rigidBodyRef.current.setTranslation(position, true);
    };
    return {
        Teleport,
    };
}
