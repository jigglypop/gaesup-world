import { useRapier } from "@react-three/rapier";
// @ts-ignore
export const getRayHit = ({ ray, ref, }) => {
    const { world } = useRapier();
    return world.castRay(ray.rayCast, ray.length, true, undefined, undefined, ref.current, undefined);
};
