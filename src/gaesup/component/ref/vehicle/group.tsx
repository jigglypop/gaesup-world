import { forwardRef, ReactNode, Ref, useContext } from "react";
import { controllerType } from "../../../controller/type";
import { GaesupWorldContext } from "../../../world/context";

export const VehicleGroup = forwardRef(
  (
    {
      props,
      children,
    }: {
      props: controllerType;
      children: ReactNode;
    },
    ref: Ref<THREE.Group>
  ) => {
    const { mode } = useContext(GaesupWorldContext);
    return (
      <group
        ref={ref}
        userData={{ intangible: true }}
        {...props.vehicle}
        visible={mode.type === "vehicle"}
      >
        {children}
      </group>
    );
  }
);
