import { jsx as _jsx } from "react/jsx-runtime";
import { useContext } from "react";
import { GaesupWorldContext } from "../../world/context/index.js";
import "./style.css";
export function JumpPortal(props) {
    var refs = useContext(GaesupWorldContext).refs;
    return (_jsx("div", { className: "jumpPortal", onClick: function () {
            var _a, _b;
            (_b = (_a = refs.rigidBodyRef) === null || _a === void 0 ? void 0 : _a.current) === null || _b === void 0 ? void 0 : _b.setTranslation(props.position, true);
        }, style: props.jumpPortalStlye, children: props.text }));
}
