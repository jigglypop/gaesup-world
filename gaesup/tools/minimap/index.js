import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useContext, useState } from "react";
import { GaesupWorldContext } from "../../world/context";
import { minimapDefault } from "./default";
import "./style.css";
// X 축은 동(+) 서(-) 방향, 즉 경도를 나타낸다.
// Z 축은 남(+) 북(-) 방향, 즉 위도를 나타낸다.
export function MiniMap(props) {
    const { minimap, activeState, mode } = useContext(GaesupWorldContext);
    const [scale, setscale] = useState(props.scale || minimapDefault.scale);
    const { minimapInnerStyle, textStyle, minimapObjectStyle, avatarStyle, scaleStyle, directionStyle, plusMinusStyle, imageStyle, minimapStyle, minimapOuterStyle, } = props;
    const upscale = useCallback(() => {
        const max = props.maxScale || minimapDefault.maxScale;
        setscale((scale) => Math.min(max, scale + 0.1));
    }, [setscale, scale]);
    const downscale = useCallback(() => {
        const min = props.minScale || minimapDefault.minScale;
        setscale((scale) => Math.max(min, scale - 0.1));
    }, [setscale, scale]);
    return (_jsxs("div", { className: "minimap", onWheel: (e) => {
            if (props.blockScale)
                return;
            if (e.deltaY <= 0)
                upscale();
            else
                downscale();
        }, style: minimapStyle, children: [_jsx("div", { className: "minimapOuter", style: minimapOuterStyle }), _jsxs("div", { className: "minimapInner", style: Object.assign({ transform: props.blockRotate || mode.control === "normal"
                        ? `translate(-50%, -50%) rotate(180deg) `
                        : `translate(-50%, -50%) rotate(${(activeState.euler.y * 180) / Math.PI + 180}deg) ` }, minimapInnerStyle), children: [_jsx("div", { className: "east direction", style: Object.assign({ transform: props.blockRotate || mode.control === "normal"
                                ? `translate(-50%, -50%) rotate(180deg) `
                                : `translate(-50%, -50%) rotate(-${(activeState.euler.y * 180) / Math.PI + 180}deg) ` }, directionStyle), children: "E" }), _jsx("div", { className: "west direction", style: Object.assign({ transform: props.blockRotate || mode.control === "normal"
                                ? `translate(50%, -50%) rotate(180deg) `
                                : `translate(50%, -50%) rotate(-${(activeState.euler.y * 180) / Math.PI + 180}deg) ` }, directionStyle), children: "W" }), _jsx("div", { className: "south direction", style: Object.assign({ transform: props.blockRotate || mode.control === "normal"
                                ? `translate(-50%, 50%) rotate(180deg) `
                                : `translate(-50%, 50%) rotate(-${(activeState.euler.y * 180) / Math.PI + 180}deg) ` }, directionStyle), children: "S" }), _jsx("div", { className: "north direction", style: Object.assign({ transform: props.blockRotate || mode.control === "normal"
                                ? `translate(-50%, -50%) rotate(180deg) `
                                : `translate(-50%, -50%) rotate(-${(activeState.euler.y * 180) / Math.PI + 180}deg) ` }, directionStyle), children: "N" }), Object.values(minimap.props).map(({ center, size, text }, key) => {
                        const X = (center.x - activeState.position.x) *
                            (props.angle ? Math.sin(props.angle) : 1) *
                            scale;
                        const Z = (center.z - activeState.position.z) *
                            (props.angle ? -Math.cos(props.angle) : 1) *
                            scale;
                        return (_jsxs("div", { children: [_jsx("div", { className: "minimapObject", style: Object.assign({ width: `${size.x * scale}rem`, height: `${size.z * scale}rem`, top: "50%", left: "50%", transform: `translate(-50.1%, -50.1%) translate(${-X}rem, ${-Z}rem) rotate(${(Math.PI * 3) / 2 + props.angle || 0}rad)`, transformOrigin: "50% 50%", zIndex: 1 + key }, minimapObjectStyle) }), key === 0 && (_jsx("div", { className: "imageObject", style: Object.assign({ width: `${size.x * scale}rem`, height: `${size.z * scale}rem`, top: "50%", left: "50%", transform: `translate(-50.1%, -50.1%) translate(${-X}rem, ${-Z}rem) rotate(${(Math.PI * 3) / 2 + props.angle || 0}rad)`, transformOrigin: "50% 50%", zIndex: 10 + key }, imageStyle) })), _jsx("div", { className: "textObject", style: {
                                        width: `${size.x * scale}rem`,
                                        height: `${size.z * scale}rem`,
                                        top: "50.1%",
                                        left: "50.1%",
                                        transform: `translate(-50.1%, -50.1%) translate(${-X}rem, ${-Z}rem)`,
                                        transformOrigin: "50.1% 50.1%",
                                        zIndex: 1001 + key,
                                    }, children: text && (_jsx("div", { className: "text", style: Object.assign(Object.assign({}, textStyle), { zIndex: 1001 + key, transform: props.blockRotate || mode.control === "normal"
                                                ? ` rotate(180deg) `
                                                : ` rotate(-${(activeState.euler.y * 180) / Math.PI + 180}deg) ` }), children: text })) })] }, key));
                    }), _jsx("div", { className: "avatar", style: avatarStyle })] }), !props.blockScaleControl && (_jsxs("div", { className: "scale", style: scaleStyle, children: [_jsx("div", { className: "plusMinus", style: plusMinusStyle, onClick: () => {
                            if (props.blockScale)
                                return;
                            downscale();
                        }, children: "+" }), "SCALE 1:", Math.round(100 / scale), _jsx("div", { className: "plusMinus", style: plusMinusStyle, onClick: () => {
                            if (props.blockScale)
                                return;
                            upscale();
                        }, children: "-" })] }))] }));
}
