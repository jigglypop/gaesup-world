import { useEffect, useState } from 'react';

import { useWorldLoadProgress, type WorldLoadStage } from 'gaesup-world';

const STAGE: Record<WorldLoadStage, string> = { assets: '섬을 불러오는 중', shaders: '빛과 그림자를 준비하는 중', ready: '다 됐어요' };

/** Covers the stage until the island's first complete frame, so it does not appear piece by piece. */
export function WorldLoading() {
  const { stage, progress, loaded, total } = useWorldLoadProgress();
  const [gone, setGone] = useState(false);
  useEffect(() => {
    if (stage !== 'ready') return undefined;
    const timer = setTimeout(() => setGone(true), 600);
    return () => clearTimeout(timer);
  }, [stage]);
  if (gone) return null;
  const detail = stage === 'assets' && total > 0 ? `모델과 텍스처 ${loaded}/${total}` : stage === 'shaders' ? '처음 한 번만 걸려요' : ' ';
  return (
    <div className={`mh-world-loading${stage === 'ready' ? ' is-done' : ''}`} role="status" aria-live="polite">
      <div className="gw-loading-card">
        <span className="gw-loading-island" aria-hidden>🏝️</span>
        <b>{STAGE[stage]}</b>
        <small>{detail}</small>
        <span className="mh-progress"><i style={{ width: `${Math.round(progress * 100)}%` }} /></span>
      </div>
    </div>
  );
}
