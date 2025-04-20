import React, { useContext, useEffect } from 'react';
import { GaesupWorldContext } from '../../world/context';
import GamePadButton from './GamePadButton';
import * as S from './style.css';
import { gameBoyDirectionType, gamepadType } from './type';

export const gamepadDefault = {
  on: true,
};

export function GamePad(props: gamepadType) {
  const { gamePadStyle, gamePadButtonStyle, label } = props;
  const { control } = useContext(GaesupWorldContext);
  
  // 디버깅을 위해 control 객체 로깅
  useEffect(() => {
    console.log('GamePad control:', control);
  }, [control]);

  // 이제 모든 키를 처리하도록 수정
  const GamePadDirections = Object.keys(control)
    .map((key) => {
      const name = label?.[key] || key;
      // 방향키만 제외하고 모든 키를 포함
      if (key !== 'forward' && key !== 'backward' && key !== 'leftward' && key !== 'rightward') {
        return {
          tag: key,
          value: key,
          name: name,
        };
      }
      return null;
    })
    .filter(item => item !== null && item !== undefined);

  // 결과 배열이 비어있는지 로깅
  useEffect(() => {
    console.log('GamePadDirections:', GamePadDirections);
  }, [GamePadDirections]);

  // 버튼이 하나도 없으면 강제로 테스트 버튼 표시
  const displayButtons = GamePadDirections.length > 0 ? GamePadDirections : [
    { tag: 'space', value: 'space', name: 'JUMP' },
    { tag: 'shift', value: 'shift', name: 'SPLINT' },
    { tag: 'keyZ', value: 'keyZ', name: 'GREET' }
  ];

  return (
    <div className={S.gamePad} style={{...gamePadStyle, border: '1px solid red'}}>
      {displayButtons.map((item: gameBoyDirectionType, index: number) => {
        return (
          <GamePadButton
            key={index}
            value={item.value}
            name={item.name}
            gamePadButtonStyle={{...gamePadButtonStyle, border: '1px solid blue'}}
          />
        );
      })}
    </div>
  );
}
