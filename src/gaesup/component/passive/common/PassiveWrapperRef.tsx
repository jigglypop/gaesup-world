import { ReactNode } from "react";
import { gaesupPassivePropsType } from "../../../hooks/useGaesupController";
import { passiveRefsType } from "../../type";
import { OuterGroupRef } from "../common/OuterGroupRef";
import { InnerGroupRef } from "./InnerGroupRef";
import { RigidBodyRef } from "./RigidbodyRef";

export function PassiveWrapperRef({
  children,
  outerChildren,
  props,
  refs,
  url,
}: {
  children: ReactNode;
  outerChildren?: ReactNode;
  props: gaesupPassivePropsType;
  refs: passiveRefsType;
  url: string;
}) {
  return (
    <OuterGroupRef ref={refs.outerGroupRef}>
      <RigidBodyRef ref={refs.rigidBodyRef}>
        {children}
        {/* {props.children} */}
        <InnerGroupRef props={props} ref={refs.innerGroupRef} url={url} />
      </RigidBodyRef>
      {outerChildren}
    </OuterGroupRef>
  );
}
