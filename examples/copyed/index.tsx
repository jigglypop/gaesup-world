"use client";

import { PassiveCharacter, V3, useGaesupController } from "../../src";

export default function Copyed() {
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
      {points.map((point, index) => {
        return (
          <PassiveCharacter
            key={index}
            position={state.position.clone().add(point)}
            rotation={state.euler.clone()}
            currentAnimation={currentAnimation}
            url={urls.characterUrl}
            rigidbodyType="dynamic"
            controllerOptions={{
              lerp: {
                cameraTurn: 0.05,
                cameraPosition: 0.05,
              },
            }}
          >
            <></>
          </PassiveCharacter>
        );
      })}
    </>
  );
}
