import { jsx as _jsx } from "react/jsx-runtime";
import { useTeleport } from "../../hooks/useTeleport";
import "./style.css";
export function JumpPortal(_a) {
    var text = _a.text, position = _a.position, jumpPortalStlye = _a.jumpPortalStlye;
    var Teleport = useTeleport().Teleport;
    return (_jsx("div", { className: "jumpPortal", onClick: function () {
            Teleport(position);
        }, style: jumpPortalStlye, children: text }));
}
