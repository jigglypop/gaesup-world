import { jsx as _jsx } from "react/jsx-runtime";
import { vec3 } from "@react-three/rapier";
import { useContext, useEffect, useRef } from "react";
import * as THREE from "three";
import { useClicker } from "../hooks/useClicker";
import { GaesupWorldContext, GaesupWorldDispatchContext, } from "../world/context";
export function GaeSupProps({ type = "normal", text, position, children, }) {
    const groupRef = useRef(null);
    const { minimap, activeState, clickerOption } = useContext(GaesupWorldContext);
    const dispatch = useContext(GaesupWorldDispatchContext);
    // clicker
    const { moveClicker } = useClicker();
    useEffect(() => {
        if (groupRef.current) {
            const box = new THREE.Box3().setFromObject(groupRef.current);
            const size = vec3(box.getSize(new THREE.Vector3())).clone();
            const center = vec3(box.getCenter(new THREE.Vector3())).clone();
            const obj = {
                type: type ? type : "normal",
                text,
                size,
                center,
            };
            minimap.props[text] = obj;
            dispatch({
                type: "update",
                payload: {
                    minimap: Object.assign({}, minimap),
                },
            });
        }
    }, []);
    return (_jsx("group", { ref: groupRef, position: position, onPointerDown: (e) => {
            if (e.srcElement instanceof HTMLDivElement)
                return;
            moveClicker(e, false, type);
        }, children: children }));
}
