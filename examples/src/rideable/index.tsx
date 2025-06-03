import { S3 } from "..";
import { Rideable, V3 } from "../../../src";

export default function Rideables() {
  return (
    <>
      {/* 차량 (Vehicle) */}
      <Rideable
        objectkey="vehicle_1"
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
      
      {/* 비행기 (Airplane) */}
      <Rideable
        objectkey="airplane_1"
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
      
      {/* 또 다른 비행기 */}
      <Rideable
        objectkey="airplane_2"
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
