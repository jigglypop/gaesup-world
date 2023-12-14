import { RapierRigidBody } from "@react-three/rapier";
import { RefObject, useContext, useEffect } from "react";
import { V3 } from "../utils/vector";
import { GaesupWorldContext } from "../world/context";

export default function setInit(rigidBodyRef: RefObject<RapierRigidBody>) {
  const { activeState } = useContext(GaesupWorldContext);
  useEffect(() => {
    rigidBodyRef.current?.setTranslation(
      activeState.position.add(V3(0, 1, 0)),
      false
    );
  }, []);
}
