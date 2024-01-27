import { jsx as _jsx } from "react/jsx-runtime";
import { useTeleport } from "../../hooks/useTeleport";
import "./style.css";
/**
 * JumpPortal component represents a clickable portal that teleports the user to a specified location.
 *
 * @param {JumpPortalType} props - The props for the JumpPortal component.
 * @param {string} props.text - (Optional) The text to display on the portal.
 * @param {THREE.Vector3} props.position - The target position to teleport to.
 * @param {CSSProperties} props.jumpPortalStyle - (Optional) CSS styles for the JumpPortal component.
 */
export function JumpPortal(_a) {
    var text = _a.text, position = _a.position, jumpPortalStyle = _a.jumpPortalStyle;
    var Teleport = useTeleport().Teleport;
    return (_jsx("div", { className: "jumpPortal", onClick: function () {
            Teleport(position);
        }, style: jumpPortalStyle, children: text }));
}
