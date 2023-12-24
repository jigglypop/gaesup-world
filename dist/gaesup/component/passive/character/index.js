import { jsx as _jsx } from "react/jsx-runtime";
import { useRef } from "react";
import mutation from "../../../mutation";
import { PassiveWrapperRef } from "../common/PassiveWrapperRef";
import { CharacterCapsuleCollider } from "./collider";
export function PassiveCharacter(_a) {
    var _b;
    var props = _a.props;
    var rigidBodyRef = useRef(null);
    var outerGroupRef = useRef(null);
    var innerGroupRef = useRef(null);
    var characterInnerRef = useRef(null);
    var refs = {
        rigidBodyRef: rigidBodyRef,
        outerGroupRef: outerGroupRef,
        innerGroupRef: innerGroupRef,
        characterInnerRef: characterInnerRef,
    };
    mutation({
        refs: refs,
        props: props,
        delta: 0.9,
    });
    return (_jsx(PassiveWrapperRef, { props: props, refs: refs, url: (_b = props.url) === null || _b === void 0 ? void 0 : _b.characterUrl, children: _jsx(CharacterCapsuleCollider, { collider: props.characterCollider }) }));
}
