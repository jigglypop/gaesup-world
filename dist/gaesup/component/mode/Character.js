import { jsx as _jsx } from "react/jsx-runtime";
import calculation from "../../physics";
import { CharacterRef } from "../ref/character";
export function Character(_a) {
    var props = _a.props, refs = _a.refs;
    calculation(props);
    return _jsx(CharacterRef, { props: props, refs: refs, isPassive: false });
}
