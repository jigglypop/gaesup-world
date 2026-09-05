import { useSceneStore } from '../../stores/sceneStore';

export type SceneFaderProps = {
  zIndex?: number;
};

/**
 * Renders a full-screen DOM overlay that fades in/out during scene
 * transitions. Mount it once near the root of your HUD.
 */
export function SceneFader({ zIndex = 9999 }: SceneFaderProps = {}) {
  const transition = useSceneStore((s) => s.transition);
  if (!transition.active && transition.progress <= 0.001) return null;

  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        background: transition.color,
        opacity: transition.progress,
        pointerEvents: transition.progress > 0.5 ? 'auto' : 'none',
        zIndex,
        transition: 'background-color 80ms linear',
      }}
    />
  );
}
