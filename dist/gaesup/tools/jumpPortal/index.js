import { jsx as _jsx } from "react/jsx-runtime";
import { useTeleport } from "../../hooks/useTeleport";
import "./style.css";
export function JumpPortal(_a) {
    var text = _a.text, position = _a.position, jumpPortalStyle = _a.jumpPortalStyle;
    var Teleport = useTeleport().Teleport;
    return (_jsx("div", { className: "jumpPortal", onClick: function () {
            Teleport(position);
        }, style: jumpPortalStyle, children: text }));
}
