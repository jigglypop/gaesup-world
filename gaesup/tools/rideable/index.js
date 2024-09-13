var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useContext, useEffect, useState } from "react";
import { euler } from "@react-three/rapier";
import { PassiveAirplane } from "../../component/passive/airplane";
import { PassiveVehicle } from "../../component/passive/vehicle";
import { useRideable } from "../../hooks/useRideable";
import { V3 } from "../../utils";
import { GaesupWorldContext } from "../../world/context";
import "./style.css";
export function Rideable(props) {
    var _a;
    const { states, rideable } = useContext(GaesupWorldContext);
    const { initRideable, ride, landing } = useRideable();
    const [_rideable] = useState({
        position: props.position || V3(0, 0, 0),
        rotation: props.rotation || euler(),
    });
    useEffect(() => {
        initRideable(props);
    }, []);
    useEffect(() => {
        if ((states === null || states === void 0 ? void 0 : states.isRiding) &&
            rideable[props.objectkey] &&
            !rideable[props.objectkey].visible) {
            landing(props.objectkey);
        }
    }, [states === null || states === void 0 ? void 0 : states.isRiding]);
    const onIntersectionEnter = (e) => __awaiter(this, void 0, void 0, function* () {
        yield ride(e, props);
    });
    return (_jsx(_Fragment, { children: ((_a = rideable === null || rideable === void 0 ? void 0 : rideable[props.objectkey]) === null || _a === void 0 ? void 0 : _a.visible) && (_jsxs("group", { userData: { intangible: true }, children: [props.objectType === "vehicle" && (_jsx(PassiveVehicle, { controllerOptions: props.controllerOptions, position: _rideable.position, rotation: _rideable.rotation, currentAnimation: "idle", url: props.url, wheelUrl: props.wheelUrl, ridingUrl: props.ridingUrl, offset: props.offset, enableRiding: props.enableRiding, rigidBodyProps: props.rigidBodyProps, sensor: true, onIntersectionEnter: onIntersectionEnter })), props.objectType === "airplane" && (_jsx(PassiveAirplane, { controllerOptions: props.controllerOptions, position: _rideable.position.clone(), rotation: _rideable.rotation.clone(), currentAnimation: "idle", url: props.url, ridingUrl: props.ridingUrl, offset: props.offset, enableRiding: props.enableRiding, rigidBodyProps: props.rigidBodyProps, sensor: true, onIntersectionEnter: onIntersectionEnter }))] })) }));
}
