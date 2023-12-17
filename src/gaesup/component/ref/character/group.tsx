import { forwardRef, ReactNode, Ref } from "react";
import { controllerType } from "../../../controller/type";

export const CharacterGroup = forwardRef(
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
    return (
      <group ref={ref} userData={{ intangible: true }} {...props.character}>
        {children}
      </group>
    );
  }
);
