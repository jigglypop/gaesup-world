import { useCallback } from 'react';
import { MINIMAP_SIZE_PX, PRETENDARD_FONT } from '../constants';
import { MinimapProps } from './type';

const directionStyles = {
  color: 'white',
  fontSize: '1.5rem',
  fontFamily: PRETENDARD_FONT,
  fontWeight: 'bold',
};

const objectStyles = {
  background: 'rgba(0,0,0,0.3)',
  boxShadow: '0 0 5px rgba(0,0,0,0.3)',
};

const avatarStyles = {
  background: '#01fff7',
  boxShadow: '0 0 10px rgba(1,255,247,0.7)',
};

const textStyles = {
  color: 'white',
  fontSize: '1rem',
  fontFamily: PRETENDARD_FONT,
  fontWeight: 'bold',
};

interface ActiveState {
  position: { x: number; y: number; z: number };
  euler: { y: number };
}

interface MinimapState {
  props: Record<
    string,
    {
      center: { x: number; z: number };
      size: { x: number; z: number };
      text?: string;
    }
  >;
}

interface Mode {
  control: string;
}

export const useCanvas = (
  activeState: ActiveState | null,
  minimap: MinimapState | null,
  mode: Mode,
  scale: number,
  angle: number,
  blockRotate: boolean,
  props: MinimapProps,
) => {
  const { minimapObjectStyle, textStyle, avatarStyle, directionStyle } = props;

  const getRotation = useCallback(
    (rotation: number) => {
      if (blockRotate || mode.control === 'normal') return 180;
      return (rotation * 180) / Math.PI + 180;
    },
    [blockRotate, mode.control],
  );

  const updateCanvas = useCallback(
    (canvasRef: React.RefObject<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas || !activeState || !minimap?.props) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const { position, euler } = activeState;
      const rotation = euler.y;

      ctx.clearRect(0, 0, MINIMAP_SIZE_PX, MINIMAP_SIZE_PX);

      ctx.save();
      ctx.beginPath();
      ctx.arc(MINIMAP_SIZE_PX / 2, MINIMAP_SIZE_PX / 2, MINIMAP_SIZE_PX / 2, 0, Math.PI * 2);
      ctx.clip();

      const gradient = ctx.createRadialGradient(
        MINIMAP_SIZE_PX / 2,
        MINIMAP_SIZE_PX / 2,
        0,
        MINIMAP_SIZE_PX / 2,
        MINIMAP_SIZE_PX / 2,
        MINIMAP_SIZE_PX / 2,
      );
      gradient.addColorStop(0, 'rgba(20, 30, 40, 0.9)');
      gradient.addColorStop(1, 'rgba(10, 20, 30, 0.95)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, MINIMAP_SIZE_PX, MINIMAP_SIZE_PX);

      const displayRotation = getRotation(rotation);
      ctx.translate(MINIMAP_SIZE_PX / 2, MINIMAP_SIZE_PX / 2);
      ctx.rotate((displayRotation * Math.PI) / 180);
      ctx.translate(-MINIMAP_SIZE_PX / 2, -MINIMAP_SIZE_PX / 2);

      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      for (let i = 0; i < MINIMAP_SIZE_PX; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, MINIMAP_SIZE_PX);
        ctx.moveTo(0, i);
        ctx.lineTo(MINIMAP_SIZE_PX, i);
        ctx.stroke();
      }
      ctx.restore();

      const drawDirections = () => {
        ctx.save();
        ctx.fillStyle = directionStyle?.color || directionStyles.color;
        ctx.font = `bold ${directionStyle?.fontSize || directionStyles.fontSize} sans-serif`;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 3;

        const dirs = [
          { text: 'N', x: MINIMAP_SIZE_PX / 2, y: 25, color: '#ff6b6b' },
          { text: 'S', x: MINIMAP_SIZE_PX / 2, y: MINIMAP_SIZE_PX - 25, color: '#4ecdc4' },
          { text: 'E', x: MINIMAP_SIZE_PX - 25, y: MINIMAP_SIZE_PX / 2, color: '#45b7d1' },
          { text: 'W', x: 25, y: MINIMAP_SIZE_PX / 2, color: '#f9ca24' },
        ];

        dirs.forEach(({ text, x, y, color }) => {
          ctx.save();
          ctx.fillStyle = color;
          ctx.translate(x, y);
          ctx.rotate((-displayRotation * Math.PI) / 180);
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(text, 0, 0);
          ctx.restore();
        });

        ctx.restore();
      };

      drawDirections();

      if (minimap?.props && typeof minimap.props === 'object') {
        Object.values(minimap.props).forEach((obj: unknown) => {
          if (!obj || typeof obj !== 'object' || !('center' in obj) || !('size' in obj)) return;

          const objectWithProps = obj as {
            center: { x: number; z: number };
            size: { x: number; z: number };
            text?: string;
          };
          const { center, size, text } = objectWithProps;

          const posX = (center.x - position.x) * (angle ? Math.sin(angle) : 1) * scale;
          const posZ = (center.z - position.z) * (angle ? -Math.cos(angle) : 1) * scale;

          ctx.save();

          const width = size.x * scale;
          const height = size.z * scale;
          const x = MINIMAP_SIZE_PX / 2 - posX - width / 2;
          const y = MINIMAP_SIZE_PX / 2 - posZ - height / 2;

          ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
          ctx.shadowBlur = 4;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;

          ctx.fillStyle = minimapObjectStyle?.background || objectStyles.background;
          ctx.fillRect(x, y, width, height);

          ctx.shadowColor = 'transparent';
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, width, height);

          if (text) {
            ctx.save();
            ctx.fillStyle = textStyle?.color || textStyles.color;
            ctx.font = `bold ${textStyle?.fontSize || textStyles.fontSize} sans-serif`;
            ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
            ctx.shadowBlur = 2;
            ctx.translate(x + width / 2, y + height / 2);
            if (blockRotate || mode.control === 'normal') {
              ctx.rotate(Math.PI);
            } else {
              ctx.rotate((-displayRotation * Math.PI) / 180);
            }
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, 0, 0);
            ctx.restore();
          }

          ctx.restore();
        });
      }

      ctx.save();

      const avatarGradient = ctx.createRadialGradient(
        MINIMAP_SIZE_PX / 2,
        MINIMAP_SIZE_PX / 2,
        0,
        MINIMAP_SIZE_PX / 2,
        MINIMAP_SIZE_PX / 2,
        12,
      );
      avatarGradient.addColorStop(0, avatarStyle?.background || avatarStyles.background);
      avatarGradient.addColorStop(0.7, avatarStyle?.background || avatarStyles.background);
      avatarGradient.addColorStop(1, 'transparent');

      ctx.fillStyle = avatarGradient;
      ctx.beginPath();
      ctx.arc(MINIMAP_SIZE_PX / 2, MINIMAP_SIZE_PX / 2, 12, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = avatarStyle?.background || avatarStyles.background;
      ctx.shadowColor = avatarStyle?.boxShadow || avatarStyles.boxShadow;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(MINIMAP_SIZE_PX / 2, MINIMAP_SIZE_PX / 2, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowColor = 'transparent';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(MINIMAP_SIZE_PX / 2, MINIMAP_SIZE_PX / 2);
      ctx.lineTo(MINIMAP_SIZE_PX / 2, MINIMAP_SIZE_PX / 2 - 12);
      ctx.stroke();

      ctx.restore();
      ctx.restore();
    },
    [
      activeState,
      minimap,
      scale,
      angle,
      blockRotate,
      mode.control,
      getRotation,
      minimapObjectStyle,
      textStyle,
      avatarStyle,
      directionStyle,
    ],
  );

  return { updateCanvas };
};
