import { jsx as _jsx } from "react/jsx-runtime";
import { useTeleport } from "../../hooks/useTeleport";
import "./style.css";
export function JumpPortal({ text, position, jumpPortalStyle, }) {
    const { Teleport } = useTeleport();
    return (_jsx("div", { className: "jumpPortal", onClick: () => {
            Teleport(position);
        }, style: jumpPortalStyle, children: text }));
}
