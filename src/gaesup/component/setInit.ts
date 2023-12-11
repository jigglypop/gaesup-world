import { RapierRigidBody } from "@react-three/rapier";
import { RefObject, useContext, useEffect } from "react";
import { GaesupWorldContext } from "../stores/context/gaesupworld";
import { V3 } from "../utils/vector";

export default function setInit(rigidBodyRef: RefObject<RapierRigidBody>) {
  const { activeState } = useContext(GaesupWorldContext);
  useEffect(() => {
    rigidBodyRef.current?.setTranslation(
      activeState.position.add(V3(0, 2, 0)),
      false
    );
  }, []);
}
