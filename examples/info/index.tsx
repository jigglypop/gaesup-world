'use client';

import { useContext } from 'react';
import { GaesupWorldContext, GaesupWorldDispatchContext } from '../../src/world/context';
import { Icon } from '../icon';
import * as style from './style.css';
import { GamePad } from '../../src/tools/gamepad';

export default function Info() {
  const { mode } = useContext(GaesupWorldContext);
  const dispatch = useContext(GaesupWorldDispatchContext);

  const setControl = (control: 'orbit' | 'normal') => {
    dispatch({
      type: 'update',
      payload: {
        mode: {
          ...mode,
          control,
        },
      },
    });
  };

  return (
    <div className={style.infoStyle}>
      <Icon
        ToolTip={
          <>
            <p
              className={style.pRecipe({ selected: mode.control === 'orbit' })}
              onClick={() => setControl('orbit')}
            >
              orbit
            </p>
            {mode.type === 'character' && (
              <p
                className={style.pRecipe({
                  selected: mode.control === 'normal',
                })}
                onClick={() => setControl('normal')}
              >
                normal
              </p>
            )}
          </>
        }
        toolTipStyles={{
          background: 'rgba(0,0,0,0.8)',
        }}
      >
        <button className={style.glassButton}>{mode.control}</button>
      </Icon>
    </div>
  );
}
