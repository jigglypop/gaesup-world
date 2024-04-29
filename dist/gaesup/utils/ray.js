import { useRapier } from "@react-three/rapier";
export var getRayHit = function (_a) {
    var ray = _a.ray, ref = _a.ref;
    var world = useRapier().world;
    return world.castRay(ray.rayCast, ray.length, true, undefined, undefined, ref.current, undefined);
};
