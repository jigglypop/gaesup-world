import { useContext } from "react";
import { GaesupWorldContext } from "../../world/context";
export function useTeleport() {
    var refs = useContext(GaesupWorldContext).refs;
    var Teleport = function (position) {
        var _a, _b;
        if (refs && refs.rigidBodyRef && refs.rigidBodyRef.current)
            (_b = (_a = refs.rigidBodyRef) === null || _a === void 0 ? void 0 : _a.current) === null || _b === void 0 ? void 0 : _b.setTranslation(position, true);
    };
    return {
        Teleport: Teleport,
    };
}
