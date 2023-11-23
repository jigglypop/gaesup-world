import { BiDownArrow } from '@react-icons/all-files/bi/BiDownArrow';
import { BiLeftArrow } from '@react-icons/all-files/bi/BiLeftArrow';
import { BiRightArrow } from '@react-icons/all-files/bi/BiRightArrow';
import { BiUpArrow } from '@react-icons/all-files/bi/BiUpArrow';
import GamePad from '../gamepad';
import GameBoyButton, { gameBoyButtonType } from './GameBoyButton';
import * as style from './style.css';

export const GameBoyDirections = [
  {
    tag: 'up',
    value: 'forward',
    icon: <BiUpArrow />
  },
  { tag: 'down', value: 'backward', icon: <BiDownArrow /> },
  { tag: 'left', value: 'leftward', icon: <BiLeftArrow /> },
  { tag: 'right', value: 'rightward', icon: <BiRightArrow /> }
];

export default function GameBoy() {
  return (
    <>
      <GamePad />
      <div className={style.gameBoy}>
        <div className={style.gameBoyInner}>
          {GameBoyDirections.map((item: gameBoyButtonType, key: number) => {
            return (
              <GameBoyButton
                key={key}
                tag={item.tag}
                value={item.value}
                icon={item.icon}
              />
            );
          })}
        </div>
      </div>
    </>
  );
}
