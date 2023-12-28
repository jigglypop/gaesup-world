import { jsx as _jsx } from "react/jsx-runtime";
import { useContext } from "react";
import { assignInlineVars } from "@vanilla-extract/dynamic";
import { GaesupWorldContext } from "../../world/context/index.js";
import * as style from "./style.css";
export default function JumpPoint() {
    var _a = useContext(GaesupWorldContext), points = _a.points, refs = _a.refs;
    return (_jsx("div", { className: style.jumpPoints, children: refs &&
            points.map(function (obj, key) {
                return (_jsx("div", { className: style.jumpPoint, onClick: function () {
                        var _a, _b;
                        (_b = (_a = refs.rigidBodyRef) === null || _a === void 0 ? void 0 : _a.current) === null || _b === void 0 ? void 0 : _b.setTranslation(obj.position, true);
                    }, children: obj.text }, key));
            }) }));
}
export function JumpPortal(props) {
    var refs = useContext(GaesupWorldContext).refs;
    return (_jsx("div", { className: style.jumpPoint, onClick: function () {
            var _a, _b;
            (_b = (_a = refs.rigidBodyRef) === null || _a === void 0 ? void 0 : _a.current) === null || _b === void 0 ? void 0 : _b.setTranslation(props.position, true);
        }, style: assignInlineVars(props.jumpPortalStlye), children: props.text }));
}
