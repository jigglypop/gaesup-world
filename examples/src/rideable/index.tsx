import { S3 } from "..";
import { Rideable, V3 } from "../../../src";

export default function Rideables() {
  return (
    <>
      <Rideable
        objectkey="gorani"
        url={S3 + "/gorani.glb"}
        objectType={"vehicle"}
        enableRiding={true}
        isRiderOn={true}
        offset={V3(0, 1, 0)}
        position={V3(-40, 0, 0)}
        controllerOptions={{
          lerp: {
            cameraPosition: 1,
            cameraTurn: 1,
          },
        }}
      />
      <Rideable
        objectkey="gaebird"
        url={S3 + "/gaebird.glb"}
        objectType={"airplane"}
        enableRiding={true}
        isRiderOn={true}
        offset={V3(0, 1, 0)}
        position={V3(40, 0, 0)}
        controllerOptions={{
          lerp: {
            cameraPosition: 1,
            cameraTurn: 1,
          },
        }}
      />
    </>
  );
}
