var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { euler, vec3 } from "@react-three/rapier";
import { useContext } from "react";
import { GaesupWorldContext, GaesupWorldDispatchContext, } from "../../world/context";
import { useGaesupGltf } from "../useGaesupGltf";
export const rideableDefault = {
    objectkey: null,
    objectType: null,
    isRiderOn: false,
    url: null,
    wheelUrl: null,
    position: vec3(),
    rotation: euler(),
    offset: vec3(),
    visible: true,
};
export function useRideable() {
    const worldContext = useContext(GaesupWorldContext);
    const { urls, states, rideable, mode } = worldContext;
    const dispatch = useContext(GaesupWorldDispatchContext);
    const { getSizesByUrls } = useGaesupGltf();
    const initRideable = (props) => {
        rideable[props.objectkey] = Object.assign(Object.assign({}, rideableDefault), props);
    };
    const setRideable = (props) => {
        rideable[props.objectkey] = props;
    };
    const getRideable = (objectkey) => {
        return rideable[objectkey];
    };
    const landing = (objectkey) => {
        const { activeState, refs } = worldContext;
        states.enableRiding = false;
        states.isRiderOn = false;
        states.rideableId = null;
        const modeType = rideable[objectkey].objectType;
        const { vehicleUrl, airplaneUrl, characterUrl } = getSizesByUrls(urls);
        const size = modeType === "vehicle" ? vehicleUrl : airplaneUrl;
        const mySize = characterUrl;
        rideable[objectkey].visible = true;
        rideable[objectkey].position.copy(activeState.position.clone());
        if (refs && refs.rigidBodyRef) {
            refs.rigidBodyRef.current.setTranslation(activeState.position
                .clone()
                .add(size.clone().add(mySize.clone()).addScalar(1)), false);
        }
        dispatch({
            type: "update",
            payload: {
                rideable: Object.assign({}, rideable),
                states: Object.assign({}, states),
                activeState: Object.assign({}, activeState),
            },
        });
    };
    const setUrl = (props) => __awaiter(this, void 0, void 0, function* () {
        urls.ridingUrl = props.ridingUrl || urls.characterUrl || null;
        if (props.objectType === "vehicle") {
            urls.vehicleUrl = props.url;
            urls.wheelUrl = props.wheelUrl || null;
        }
        else if (props.objectType === "airplane") {
            urls.airplaneUrl = props.url;
        }
        dispatch({
            type: "update",
            payload: {
                urls: Object.assign({}, urls),
            },
        });
    });
    const setModeAndRiding = (props) => __awaiter(this, void 0, void 0, function* () {
        mode.type = props.objectType;
        states.enableRiding = props.enableRiding;
        states.isRiderOn = true;
        states.rideableId = props.objectkey;
        rideable[props.objectkey].visible = false;
        dispatch({
            type: "update",
            payload: {
                mode: Object.assign({}, mode),
                states: Object.assign({}, states),
            },
        });
    });
    const ride = (e, props) => __awaiter(this, void 0, void 0, function* () {
        if (e.other.rigidBodyObject.name === "character") {
            yield setUrl(props);
            yield setModeAndRiding(props);
        }
    });
    return {
        initRideable,
        setRideable,
        getRideable,
        ride,
        landing,
    };
}
