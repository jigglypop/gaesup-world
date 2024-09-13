import { jsx as _jsx } from "react/jsx-runtime";
import { CharacterInnerRef } from "../../inner/character";
export function CharacterRef({ children, props, refs, urls, }) {
    return (_jsx(CharacterInnerRef, Object.assign({ url: urls.characterUrl, isActive: true, componentType: "character", rigidbodyType: "dynamic", controllerOptions: props.controllerOptions, groundRay: props.groundRay, onAnimate: props.onAnimate, onFrame: props.onFrame, onReady: props.onReady, onDestory: props.onDestory, rigidBodyProps: props.rigidBodyProps, parts: props.parts }, refs, { children: children })));
}
