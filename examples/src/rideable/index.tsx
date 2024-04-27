import { S3 } from "..";
import { Rideable, V3 } from "../../../src";

export default function Rideables() {
  return (
    <>
      <Rideable
        objectkey="gaebird_1"
        url={S3 + "/gorani.glb"}
        objectType={"vehicle"}
        enableRiding={true}
        offset={V3(0, 1, 0)}
        position={V3(-10, 2, 10)}
        controllerOptions={{
          lerp: {
            cameraPosition: 1,
            cameraTurn: 1,
          },
        }}
      />
      <Rideable
        objectkey="gaebird_2"
        url={S3 + "/gaebird.glb"}
        objectType={"airplane"}
        enableRiding={true}
        offset={V3(0, 1, 0)}
        position={V3(10, 2, 10)}
        controllerOptions={{
          lerp: {
            cameraPosition: 1,
            cameraTurn: 1,
          },
        }}
      />
      <Rideable
        objectkey="gaebird_3"
        url={S3 + "/orri.glb"}
        objectType={"airplane"}
        enableRiding={true}
        offset={V3(0, 1, 0)}
        position={V3(20, 2, 10)}
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
