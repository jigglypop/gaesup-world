import { forwardRef, ReactNode, Ref, useContext } from "react";
import { GaesupWorldContext } from "../../../world/context";

export const PassiveCharacterOuterGroup = forwardRef(
  (
    {
      children,
    }: {
      children: ReactNode;
    },
    ref: Ref<THREE.Group>
  ) => {
    const { mode } = useContext(GaesupWorldContext);
    return (
      <group
        ref={ref}
        userData={{ intangible: true }}
        visible={mode.type === "character"}
      >
        {children}
      </group>
    );
  }
);
