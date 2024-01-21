import { ReactNode } from "react";
import { refsType } from "../../../controller/type";
import { urlsType } from "../../../world/context/type";
import { VehicleInnerRef } from "../../inner/vehicle";

export function VehicleRef({
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
    <VehicleInnerRef
      refs={refs}
      urls={urls}
      isRiderOn={isRiderOn}
      enableRiding={enableRiding}
      offset={offset}
    >
      {children}
    </VehicleInnerRef>
  );
}
