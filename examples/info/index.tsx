'use client';

import { useContext } from 'react';

import { V3 } from '../../src';
import { GaesupWorldContext, GaesupWorldDispatchContext } from '../../src/gaesup/world/context';
import { Icon } from '../icon';
import * as style from './style.css';
// FaCarSide lazy loading

export default function Info() {
  const { mode } = useContext(GaesupWorldContext);
  const dispatch = useContext(GaesupWorldDispatchContext);

  const setType = (type: 'character' | 'vehicle' | 'airplane') => {
    dispatch({
      type: 'update',
      payload: {
        mode: {
          ...mode,
          type: type,
          control: 'orbit',
        },
      },
    });
  };

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
              className={style.pRecipe({ selected: mode.type === 'character' })}
              onClick={() => setType('character')}
            >
              character
            </p>
            <p
              className={style.pRecipe({ selected: mode.type === 'vehicle' })}
              onClick={() => setType('vehicle')}
            >
              vehicle
            </p>
            <p
              className={style.pRecipe({ selected: mode.type === 'airplane' })}
              onClick={() => setType('airplane')}
            >
              airplane
            </p>
          </>
        }
        toolTipStyles={{
          background: 'rgba(0,0,0,0.8)',
        }}
      >
        <button className={style.glassButton}>{mode.type}</button>
      </Icon>
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
      <Icon
        ToolTip={<></>}
        toolTipStyles={{
          background: 'rgba(0,0,0,0.8)',
        }}
      >
        <button className={style.glassButton}>{mode.controller}</button>
      </Icon>
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
