import { airplane } from "./airplane";
import { character } from "./character";
import getGltf from "./gltf";
import { vehicle } from "./vehicle";
export default function initColider(_a) {
    var value = _a.value, dispatch = _a.dispatch;
    var colliderProps = {
        gltf: null,
        value: value,
        dispatch: dispatch,
    };
    var gltf = getGltf(colliderProps);
    colliderProps.gltf = gltf;
    character(colliderProps);
    vehicle(colliderProps);
    airplane(colliderProps);
}
