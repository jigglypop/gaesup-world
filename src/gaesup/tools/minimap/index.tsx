'use client';

import { currentAtom } from '@gaesup/stores/current';
import { minimapAtom } from '@gaesup/stores/minimap';
import { optionsAtom } from '@gaesup/stores/options';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import { useAtomValue } from 'jotai';
import * as style from './style.css';

export function MiniMapInner() {
  const minimap = useAtomValue(minimapAtom);
  const current = useAtomValue(currentAtom);
  const options = useAtomValue(optionsAtom);

  return (
    <div className={style.minimap}>
      <div className={style.minimapOuter}></div>
      <div className={style.minimapInner}>
        {Object.values(minimap).map((obj, key) => {
          return (
            <div
              key={key}
              className={style.minimapObject}
              style={assignInlineVars({
                width: `${obj.size.x}rem`,
                height: `${obj.size.z}rem`,
                transform: `translate(${
                  -obj.center.x + current.position.x * options.minimapRatio
                }rem, ${
                  -obj.center.z + current.position.z * options.minimapRatio
                }rem)`
              })}
            >
              <div className={style.text}>{obj.text}</div>
            </div>
          );
        })}
        <div className={style.avatar} />
      </div>
    </div>
  );
}

export default function MiniMap() {
  return <MiniMapInner />;
}
