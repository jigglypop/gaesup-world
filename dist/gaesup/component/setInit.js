import { useContext, useEffect } from "react";
import { V3 } from "../utils/vector";
import { GaesupWorldContext } from "../world/context";
export default function setInit(rigidBodyRef) {
    var activeState = useContext(GaesupWorldContext).activeState;
    useEffect(function () {
        var _a;
        (_a = rigidBodyRef.current) === null || _a === void 0 ? void 0 : _a.setTranslation(activeState.position.add(V3(0, 1, 0)), false);
    }, []);
}
