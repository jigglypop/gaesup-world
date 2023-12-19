import { jsx as _jsx } from "react/jsx-runtime";
import { useRef } from "react";
import mutation from "../../../mutation";
import { PassiveCharacterInnerGroupRef } from "./innerGltf";
import { PassiveCharacterOuterGroup } from "./outerGroup";
import { PassiveCharacterRigidBody } from "./rigidbody";
export function PassiveCharacter(_a) {
    var mode = _a.mode, state = _a.state, url = _a.url, current = _a.current;
    var passiveCharacterRef = useRef(null);
    var passiveCharacterOuterRef = useRef(null);
    var passiveRigidBodyRef = useRef(null);
    mutation({
        outerGroupRef: passiveCharacterOuterRef,
        rigidBodyRef: passiveRigidBodyRef,
        state: state,
        mode: mode,
        delta: 0.9,
    });
    return (_jsx(PassiveCharacterRigidBody, { ref: passiveRigidBodyRef, children: _jsx(PassiveCharacterOuterGroup, { ref: passiveCharacterOuterRef, children: _jsx(PassiveCharacterInnerGroupRef, { url: url, current: current, ref: passiveCharacterRef }) }) }));
}
