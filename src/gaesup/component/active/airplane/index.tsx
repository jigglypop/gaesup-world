import { ReactNode } from "react";
import { refsType } from "../../../controller/type";
import { urlsType } from "../../../world/context/type";
import { AirplaneInnerRef } from "../../inner/airplane";

export function AirplaneRef({
  children,
  enableRiding,
  isRiderOn,
  offset,
  refs,
  urls,
}: {
  children: ReactNode;
  enableRiding?: boolean;
  isRiderOn?: boolean;
  offset?: THREE.Vector3;
  refs: refsType;
  urls: urlsType;
}) {
  return (
    <AirplaneInnerRef
      refs={refs}
      urls={urls}
      isRiderOn={isRiderOn}
      enableRiding={enableRiding}
      offset={offset}
    >
      {children}
    </AirplaneInnerRef>
  );
}
