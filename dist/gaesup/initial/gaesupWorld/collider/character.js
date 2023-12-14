import { useEffect } from "react";
export function character(_a) {
    var gltf = _a.gltf, value = _a.value, dispatch = _a.dispatch;
    var url = value.url;
    if (!url || !url.characterUrl)
        return;
    var characterSize = gltf.characterSize;
    useEffect(function () {
        if (characterSize.x !== 0 &&
            characterSize.y !== 0 &&
            characterSize.z !== 0) {
            var heightPlusDiameter = characterSize.y / 2;
            var diameter = Math.max(characterSize.x, characterSize.z);
            var radius = diameter / 2;
            var height = heightPlusDiameter - radius;
            var halfHeight = height / 2;
            dispatch({
                type: "update",
                payload: {
                    characterCollider: {
                        height: height,
                        halfHeight: halfHeight,
                        radius: radius,
                        diameter: diameter,
                    },
                },
            });
        }
    }, [characterSize.x, characterSize.y, characterSize.z]);
}
