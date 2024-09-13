"use client";

import { euler } from "@react-three/rapier";
import {
  PassiveAirplane,
  PassiveCharacter,
  PassiveVehicle,
  V3,
  useGaesupController,
} from "../../src";
import { S3 } from "../src";

export default function Passive() {
  const points = [V3(10, 0, 10)];
  for (let x = -10; x <= 10; x += 30) {
    for (let y = -10; y <= 10; y += 30) {
      points.push(V3(x, 0, y));
    }
  }
  const gaesupState = useGaesupController();
  const { state, currentAnimation, urls } = gaesupState;
  // setTimeout으로 1초마다 상태값 변경하게 하는 로직

  //
  //   const [states, setStates] = useState<any>({
  //     state: {
  //       position: V3(0, 0, 0),
  //       euler: euler(),
  //     },
  //     currentAnimation: "idle",
  //     urls: { ...urls },
  //   });
  //   // throttle
  //   const sendSocket = useCallback(
  //     (gaesupState) => {
  //       const { state: newState } = gaesupState;
  //       setStates({
  //         state: {
  //           ...newState,
  //         },
  //         currentAnimation,
  //         urls: { ...urls },
  //       });
  //     },
  //     [currentAnimation]
  //   );
  //
  //   const throttledSocket = useMemo(
  //     () => throttle(sendSocket, 200),
  //     [sendSocket]
  //   );
  //
  //   const onSend = useCallback(
  //     (gaesupState) => {
  //       throttledSocket(gaesupState);
  //     },
  //     [throttledSocket]
  //   );
  //
  //   useEffect(() => {
  //     onSend(gaesupState);
  //   }, [
  //     state.position.x,
  //     state.position.y,
  //     state.position.z,
  //     state.euler.x,
  //     state.euler.y,
  //     state.euler.z,
  //     currentAnimation,
  //     urls,
  //   ]);
  //
  //   useEffect(() => {
  //     return () => {
  //       throttledSocket.cancel();
  //     };
  //   }, [throttledSocket]);

  return (
    <>
      <PassiveCharacter
        position={V3(10, 0, 0)}
        rotation={euler()}
        url={"gltf/ally_body.glb"}
        currentAnimation="jump"
        rigidbodyType={"fixed"}
        isNotColliding={true}
        parts={[{ url: "gltf/ally_cloth_rabbit.glb", color: "red" }]}
      ></PassiveCharacter>
      <PassiveVehicle
        position={V3(20, 0, 0)}
        rotation={euler()}
        url={S3 + "/gaebird.glb"}
        currentAnimation="idle"
        rigidbodyType={"fixed"}
        isNotColliding={true}
      ></PassiveVehicle>
      <group visible={false}>
        <PassiveAirplane
          position={V3(30, 0, 0)}
          rotation={euler()}
          url={S3 + "/gaebird.glb"}
          currentAnimation="idle"
          rigidbodyType={"fixed"}
          isNotColliding={true}
        ></PassiveAirplane>
      </group>
    </>
  );
}
