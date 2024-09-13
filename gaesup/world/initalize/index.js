import { useMemo, useReducer } from "react";
import { gaesupWorldDefault } from "../../world/context";
import { gaesupWorldReducer } from "../../world/context/reducer";
export default function initGaesupWorld(props) {
    const [value, dispatch] = useReducer(gaesupWorldReducer, {
        activeState: Object.assign(Object.assign({}, gaesupWorldDefault.activeState), { position: props.startPosition || gaesupWorldDefault.activeState.position }),
        cameraOption: Object.assign(gaesupWorldDefault.cameraOption, props.cameraOption || {}),
        mode: Object.assign(gaesupWorldDefault.mode, props.mode || {}),
        urls: Object.assign(gaesupWorldDefault.urls, props.urls || {}),
        refs: null,
        states: gaesupWorldDefault.states,
        rideable: gaesupWorldDefault.rideable,
        minimap: gaesupWorldDefault.minimap,
        control: gaesupWorldDefault.control,
        clicker: gaesupWorldDefault.clicker,
        clickerOption: Object.assign(gaesupWorldDefault.clickerOption, props.clickerOption || {}),
        animationState: gaesupWorldDefault.animationState,
        block: Object.assign(gaesupWorldDefault.block, props.block || {}),
        sizes: gaesupWorldDefault.sizes,
    });
    const gaesupProps = useMemo(() => ({ value: value, dispatch }), [value, value.block, dispatch]);
    return {
        gaesupProps,
    };
}
