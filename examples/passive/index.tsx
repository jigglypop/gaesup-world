"use client";

import { euler } from "@react-three/rapier";
import { throttle } from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react";
import { V3, useGaesupController } from "../../src";

export default function Passive() {
  const points = [V3(10, 0, 10)];
  for (let x = -5; x <= 5; x += 5) {
    for (let y = -5; y <= 5; y += 5) {
      points.push(V3(x, 0, y));
    }
  }
  // setTimeout으로 1초마다 상태값 변경하게 하는 로직

  const gaesupState = useGaesupController();
  const { state, currentAnimation, urls } = gaesupState;

  const [states, setStates] = useState<any>({
    state: {
      position: V3(0, 0, 0),
      euler: euler(),
    },
    currentAnimation: "idle",
    urls: { ...urls },
  });
  // throttle
  const sendSocket = useCallback(
    (gaesupState) => {
      const { state: newState } = gaesupState;
      setStates({
        state: {
          ...newState,
        },

        currentAnimation,
        urls: { ...urls },
      });
    },
    [currentAnimation]
  );

  const throttledSocket = useMemo(
    () => throttle(sendSocket, 200),
    [sendSocket]
  );

  const onSend = useCallback(
    (gaesupState) => {
      throttledSocket(gaesupState);
    },
    [throttledSocket]
  );

  useEffect(() => {
    onSend(gaesupState);
  }, [
    state.position.x,
    state.position.y,
    state.position.z,
    state.euler.x,
    state.euler.y,
    state.euler.z,
    currentAnimation,
    urls,
  ]);

  useEffect(() => {
    return () => {
      throttledSocket.cancel();
    };
  }, [throttledSocket]);

  return (
    <group>
      {/* {points.map((point, index) => {
        return (
          <PassiveCharacter
            key={index}
            position={states.state.position.clone().add(point)}
            positionLerp={0.005}
            euler={states.state.euler.clone()}
            currentAnimation={states.currentAnimation}
            urls={states.urls}
          >
            <></>
          </PassiveCharacter>
        );
      })} */}
    </group>
  );
}
