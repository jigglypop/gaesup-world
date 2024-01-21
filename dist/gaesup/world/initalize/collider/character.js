import { useEffect } from "react";
import { isVectorNonZero } from "../../../utils";
import { update } from "../../../utils/context";
export function character(_a) {
    var gltf = _a.gltf, value = _a.value, dispatch = _a.dispatch;
    var url = value.url;
    if (!url || !url.characterUrl)
        return;
    var characterSize = gltf.characterSize;
    useEffect(function () {
        if (isVectorNonZero(characterSize)) {
            var heightPlusDiameter = characterSize.y / 2;
            var diameter = Math.max(characterSize.x, characterSize.z);
            var radius = diameter / 2;
            var height = heightPlusDiameter - radius;
            var halfHeight = height / 2;
            update({
                characterCollider: {
                    height: height,
                    halfHeight: halfHeight,
                    radius: radius,
                    diameter: diameter,
                },
            }, dispatch);
        }
    }, [characterSize.x, characterSize.y, characterSize.z]);
}
