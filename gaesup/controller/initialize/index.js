import { vec3 } from "@react-three/rapier";
import { useCallback, useContext, useEffect, useMemo } from "react";
import * as THREE from "three";
import { update } from "../../utils/context";
import { GaesupWorldContext, GaesupWorldDispatchContext, } from "../../world/context";
export default function initControllerProps(props) {
    const context = useContext(GaesupWorldContext);
    const dispatch = useContext(GaesupWorldDispatchContext);
    useEffect(() => {
        if (context && context.control) {
            // 컨트롤 정하기
            let newControl = {};
            if (context.mode.controller === "clicker") {
                if (context.mode.isButton) {
                    newControl = Object.assign({}, context.control);
                }
            }
            else {
                newControl = Object.assign({}, context.control);
            }
            dispatch({
                type: "update",
                payload: {
                    control: Object.assign({}, newControl),
                },
            });
        }
    }, [context === null || context === void 0 ? void 0 : context.mode.controller, context === null || context === void 0 ? void 0 : context.control]);
    const groundRay = useMemo(() => {
        return {
            origin: vec3(),
            dir: vec3({ x: 0, y: -1, z: 0 }),
            offset: vec3({ x: 0, y: -1, z: 0 }),
            hit: null,
            parent: null,
            rayCast: null,
            length: 10,
        };
    }, []);
    const cameraRay = useMemo(() => {
        return {
            origin: vec3(),
            hit: new THREE.Raycaster(),
            rayCast: new THREE.Raycaster(vec3(), vec3(), 0, -7),
            dir: vec3(),
            position: vec3(),
            length: -context.cameraOption.maxDistance,
            detected: [],
            intersects: [],
            intersectObjectMap: {},
        };
    }, []);
    const initRefs = useCallback((refs) => {
        update({
            refs: Object.assign({}, refs),
        }, dispatch);
    }, [props.refs]);
    useEffect(() => {
        if (props.refs) {
            initRefs(props.refs);
        }
    }, []);
    return {
        groundRay,
        cameraRay,
    };
}
