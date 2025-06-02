// GamePad.tsx
import { useContext } from 'react';
import { useAtomValue } from 'jotai';
import { GaesupWorldContext } from '../../world/context';
import { modeAtom, inputSystemAtom } from '../../atoms';
import GamePadButton from './GamePadButton';
import * as S from './style.css';
import { gameBoyDirectionType, gamepadType } from './type';

export const gamepadDefault = {
  on: true,
};

export function GamePad(props: gamepadType) {
  const { gamePadStyle, gamePadButtonStyle, label } = props;
  
  // === 새로운 시스템: atom에서 keyboard 상태 읽기 ===
  const inputSystem = useAtomValue(inputSystemAtom);
  const keyboard = inputSystem.keyboard;
  
  // === 기존 시스템: 하위 호환성을 위해 유지 (현재는 사용하지 않음) ===
  // const { control } = useContext(GaesupWorldContext);
  
  const mode = useAtomValue(modeAtom);
  
  // keyboard 상태를 기반으로 GamePad 버튼 목록 생성
  const GamePadDirections = Object.keys(keyboard)
    .map((key) => {
      const name = label?.[key] || key;
      // 방향키 (forward, backward, leftward, rightward)와 run은 제외
      if (key !== 'forward' && key !== 'backward' && key !== 'leftward' && key !== 'rightward' && key !== 'run')
        return {
          tag: key,
          value: key,
          name: name,
        };
    })
    .filter((item) => item !== undefined)
    .filter((item: gameBoyDirectionType) => !(item.tag === 'run'));

  return (
    <>
      {mode.controller === 'clicker' && (
        <div className={S.gamePad} style={gamePadStyle}>
          {GamePadDirections.map((item: gameBoyDirectionType, key: number) => {
            return (
              <GamePadButton
                key={key}
                value={item.value}
                name={item.name}
                gamePadButtonStyle={gamePadButtonStyle}
              />
            );
          })}
        </div>
      )}
    </>
  );
}
