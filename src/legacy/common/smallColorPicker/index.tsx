'use client';

import { useEffect, useState } from 'react';
import { SketchPicker } from 'react-color';
import * as S from './styles.css';

export default function SmallColorPicker({
  color,
  setColor,
}: {
  color: string;
  colors?: { [key: string]: string };
  setColor: (color: { color: string }) => void;
}) {
  const parsedColor = color.replace('rgb(', '').replace(')', '').replace(' ', '').split(',');

  useEffect(() => {
    setRgb({
      r: parseInt(parsedColor[0]) || 100,
      g: parseInt(parsedColor[1]) || 100,
      b: parseInt(parsedColor[2]) || 100,
    });
  }, [color]);

  const [rgb, setRgb] = useState({
    r: parseInt(parsedColor[0]) || 100,
    g: parseInt(parsedColor[1]) || 100,
    b: parseInt(parsedColor[2]) || 100,
  });
  return (
    <div className={S.outer}>
      <SketchPicker
        styles={{
          default: {
            picker: {
              background: 'rgba(100,100,100,0)',
              position: 'relative',
              width: '10rem',
              height: '10rem',
              overflow: 'hidden',
            },
          },
        }}
        onChange={(color) => {
          setRgb(color.rgb);
          setColor({
            color: `rgb(${color.rgb.r},${color.rgb.g},${color.rgb.b})`,
          });
        }}
        color={rgb}
      />
    </div>
  );
}
