"use client";

import { PassiveCharacter, V3, useGaesupController } from "../../src";
import { useCharacterPool } from "../../src/gaesup/hooks/useCharacterPool";
import { useMemo, useEffect, useState } from "react";

export default function OptimizedCopyed() {
  // CharacterPool 설정
  const characterPool = useCharacterPool({
    maxInstances: 20, // 9개보다 여유있게 설정
    updateInterval: 16, // 60fps
    cullingDistance: 100, // 100 단위 거리에서 컬링
  });

  // points를 useMemo로 캐시
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

  // 캐릭터 ID 관리
  const [characterIds, setCharacterIds] = useState<(string | null)[]>([]);

  // controllerOptions를 미리 계산
  const controllerOptions = useMemo(() => ({
    lerp: {
      cameraTurn: 0.05,
      cameraPosition: 0.05,
    },
  }), []);

  // 캐릭터 풀에서 캐릭터 획득/해제
  useEffect(() => {
    const newIds: (string | null)[] = [];
    
    // 기존 캐릭터들 해제
    characterIds.forEach(id => {
      if (id) {
        characterPool.releaseCharacter(id);
      }
    });

    // 새로운 캐릭터들 획득
    points.forEach((point, index) => {
      const position = state.position.clone().add(point);
      const rotation = state.euler.clone();
      const id = characterPool.acquireCharacter(position, rotation, currentAnimation);
      newIds.push(id);
    });

    setCharacterIds(newIds);

    // 컴포넌트 언마운트 시 정리
    return () => {
      newIds.forEach(id => {
        if (id) {
          characterPool.releaseCharacter(id);
        }
      });
    };
  }, [points.length]); // points 개수가 변경될 때만 재실행

  // 캐릭터 위치 업데이트 (상태 변경 시)
  useEffect(() => {
    characterIds.forEach((id, index) => {
      if (id && points[index]) {
        const position = state.position.clone().add(points[index]);
        const rotation = state.euler.clone();
        characterPool.updateCharacter(id, position, rotation, currentAnimation);
      }
    });
  }, [state.position, state.euler, currentAnimation, characterIds, points, characterPool]);

  // 풀 통계 표시 (개발용)
  const poolStats = characterPool.getStats();
  const activeCharacters = characterPool.getActiveCharacters();

  return (
    <>
      {/* 개발용 통계 표시 */}
      <div style={{ 
        position: 'absolute', 
        top: 10, 
        left: 10, 
        color: 'white', 
        background: 'rgba(0,0,0,0.7)', 
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        zIndex: 1000
      }}>
        <div>Pool Stats:</div>
        <div>Total: {poolStats.total}</div>
        <div>Active: {poolStats.active}</div>
        <div>Available: {poolStats.available}</div>
        <div>Utilization: {poolStats.utilization.toFixed(1)}%</div>
      </div>

      {/* 실제 렌더링은 풀에서 관리되는 활성 캐릭터들만 */}
      {activeCharacters.map((character) => (
        <PassiveCharacter
          key={character.id}
          position={character.position}
          rotation={character.rotation}
          currentAnimation={character.currentAnimation}
          url={urls.characterUrl}
          rigidbodyType="dynamic"
          controllerOptions={controllerOptions}
        >
          <></>
        </PassiveCharacter>
      ))}
    </>
  );
} 