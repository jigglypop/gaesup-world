import { jsx as _jsx } from "react/jsx-runtime";
import { useState } from "react";
import { usePushKey } from "../../hooks/usePushKey";
import "./style.css";
export default function GamePadButton({ value, name, gamePadButtonStyle, }) {
    const [isClicked, setIsClicked] = useState(false);
    const { pushKey } = usePushKey();
    const onMouseDown = () => {
        pushKey(value, true);
        setIsClicked(true);
    };
    const onMouseLeave = () => {
        pushKey(value, false);
        setIsClicked(false);
    };
    return (_jsx("button", { className: `padButton ${isClicked ? "isClicked" : ""}`, onMouseDown: () => onMouseDown(), onMouseUp: () => onMouseLeave(), onMouseLeave: () => onMouseLeave(), onContextMenu: (e) => {
            e.preventDefault();
            onMouseLeave();
        }, onPointerDown: () => onMouseDown(), onPointerUp: () => onMouseLeave(), style: gamePadButtonStyle, children: name }));
}
