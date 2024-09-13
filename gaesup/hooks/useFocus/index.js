var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { useContext } from "react";
import { makeNormalCameraPosition } from "../../camera/control/normal";
import { GaesupWorldContext, GaesupWorldDispatchContext, } from "../../world/context";
export function useFocus() {
    const { cameraOption, activeState, block } = useContext(GaesupWorldContext);
    const dispatch = useContext(GaesupWorldDispatchContext);
    const dispatchAsync = () => __awaiter(this, void 0, void 0, function* () {
        dispatch({
            type: "update",
            payload: {
                cameraOption: cameraOption,
            },
        });
    });
    const close = () => __awaiter(this, void 0, void 0, function* () {
        block.control = true;
        block.animation = true;
        dispatch({
            type: "update",
            payload: {
                block: block,
            },
        });
    });
    const open = () => __awaiter(this, void 0, void 0, function* () {
        block.control = false;
        block.animation = false;
        dispatch({
            type: "update",
            payload: {
                block: block,
            },
        });
    });
    const on = () => __awaiter(this, void 0, void 0, function* () {
        cameraOption.focus = true;
        dispatch({
            type: "update",
            payload: {
                cameraOption: cameraOption,
            },
        });
    });
    const off = () => __awaiter(this, void 0, void 0, function* () {
        cameraOption.focus = false;
        dispatch({
            type: "update",
            payload: {
                cameraOption: cameraOption,
            },
        });
    });
    const focus = (_a) => __awaiter(this, [_a], void 0, function* ({ zoom, target, position, }) {
        if (zoom)
            cameraOption.zoom = zoom;
        cameraOption.position.lerp(position, 0.1);
        cameraOption.target.lerp(target, 0.1);
    });
    const free = (_a) => __awaiter(this, [_a], void 0, function* ({ zoom }) {
        if (zoom)
            cameraOption.zoom = zoom;
        cameraOption.position.lerp(makeNormalCameraPosition(activeState, cameraOption), 0.1);
        cameraOption.target.lerp(activeState.position.clone(), 0.1);
    });
    const move = (_a) => __awaiter(this, [_a], void 0, function* ({ newPosition }) {
        cameraOption.position.lerp(newPosition.clone(), 0.1);
    });
    const focusOn = (_a) => __awaiter(this, [_a], void 0, function* ({ zoom, target, position, }) {
        yield close();
        yield on();
        yield move({ newPosition: position });
        yield focus({ zoom, target, position });
        yield dispatchAsync();
    });
    const focusOff = (_a) => __awaiter(this, [_a], void 0, function* ({ zoom }) {
        yield open();
        yield off();
        yield move({
            newPosition: makeNormalCameraPosition(activeState, cameraOption),
        });
        yield free({ zoom });
        yield dispatchAsync();
    });
    return {
        open,
        close,
        on,
        off,
        focus,
        free,
        focusOn,
        focusOff,
    };
}
