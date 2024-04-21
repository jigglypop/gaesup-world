import { jsx as _jsx } from "react/jsx-runtime";
import { CharacterInnerRef } from "../../inner/character";
export function CharacterRef(_a) {
    var props = _a.props, refs = _a.refs, urls = _a.urls;
    return (_jsx(CharacterInnerRef, { refs: refs, urls: urls, outerGroupRef: refs.outerGroupRef, innerGroupRef: refs.innerGroupRef, rigidBodyRef: refs.rigidBodyRef, colliderRef: refs.colliderRef, isActive: true, componentType: "character", children: props.children }));
}
