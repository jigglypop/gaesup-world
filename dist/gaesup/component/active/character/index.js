import { jsx as _jsx } from "react/jsx-runtime";
import { useContext } from "react";
import initCallback from "../../../controller/initialize/callback";
import { GaesupWorldContext } from "../../../world/context";
import { CharacterCapsuleCollider } from "./collider";
import playCharacterActions from "../../../animation/actions";
import { WrapperRef } from "../common/WrapperRef";
export function CharacterRef(_a) {
    var props = _a.props, refs = _a.refs;
    initCallback(props);
    var characterGltf = useContext(GaesupWorldContext).characterGltf;
    var ref = playCharacterActions({
        groundRay: props.groundRay,
    }).ref;
    return (_jsx(WrapperRef, { props: props, refs: refs, gltf: characterGltf, animationRef: ref, children: _jsx(CharacterCapsuleCollider, { props: props, ref: refs.capsuleColliderRef }) }));
}
