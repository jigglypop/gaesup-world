'use client';

import { PassiveCharacter, V3, useGaesupController } from '../../src';
import { useMemo } from 'react';

export default function Copyed() {
  const points = useMemo(() => {
    const pointsArray = [V3(10, 0, 10)];
    for (let x = -10; x <= 10; x += 30) {
      for (let y = -10; y <= 10; y += 30) {
        pointsArray.push(V3(x, 0, y));
      }
    }
    return pointsArray;
  }, []);

  const gaesupState = useGaesupController();
  const { state, currentAnimation, urls } = gaesupState;

  const controllerOptions = useMemo(
    () => ({
      lerp: {
        cameraTurn: 0.05,
        cameraPosition: 0.05,
      },
    }),
    [],
  );

  return (
    <>
      {points.map((point, index) => {
        return (
          <PassiveCharacter
            key={`character-${index}`} // 더 명확한 키
            position={state.position.clone().add(point)}
            rotation={state.euler.clone()}
            currentAnimation={currentAnimation}
            url={urls.characterUrl}
            rigidbodyType="dynamic"
            controllerOptions={controllerOptions}
          >
            <></>
          </PassiveCharacter>
        );
      })}
    </>
  );
}
