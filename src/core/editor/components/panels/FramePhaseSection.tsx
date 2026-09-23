import { FRAME_PHASES, type FramePhase } from '../../../runtime/frame/types';
import { useGaesupStore } from '../../../stores/gaesupStore';

const FRAME_PHASE_LABELS: Record<FramePhase, string> = {
  input: '입력',
  script: '스크립트',
  prePhysics: '물리 전',
  postPhysics: '물리 후',
  animation: '애니메이션',
  lateUpdate: '후처리 갱신',
  camera: '카메라',
  effects: '이펙트',
  snapshot: '스냅샷',
};

export function FramePhaseSection() {
  const framePhases = useGaesupStore((state) => state.framePhases);
  if (!framePhases) return null;
  let total = 0;
  for (const phase of FRAME_PHASES) total += framePhases[phase];

  return (
    <div className="perf-stat-group">
      <div className="perf-header">
        <h4 className="perf-title">엔진 프레임 단계</h4>
        <span className="perf-current">{total.toFixed(2)} ms</span>
      </div>
      <div className="perf-details-grid">
        {FRAME_PHASES.map((phase) => (
          <div key={phase}>
            <span className="perf-label">{FRAME_PHASE_LABELS[phase]}</span>
            {framePhases[phase].toFixed(2)}
          </div>
        ))}
      </div>
    </div>
  );
}
