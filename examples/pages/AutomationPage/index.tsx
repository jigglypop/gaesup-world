import { useCallback, useEffect, useRef, useState } from 'react';

import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';

import { useGaesupStore, useStateSystem, useTeleport, teleportDestinationToVector3 } from 'gaesup-world';

import { TELEPORT_POINTS } from '../../components/teleport/constants';
import { WorldPage } from '../World';
import './styles.css';

const MOVE_DISTANCE = 4;
const WAIT_DURATION_MS = 2000;
const POSITION_UPDATE_INTERVAL_SECONDS = 0.1;

function PositionProbe({ onChange }: { onChange: (position: Vector3, grounded: boolean) => void }) {
  const { activeState, gameStates } = useStateSystem();
  const elapsed = useRef(0);
  useFrame((_, delta) => {
    elapsed.current += delta;
    if (elapsed.current < POSITION_UPDATE_INTERVAL_SECONDS) return;
    elapsed.current = 0;
    onChange(activeState.position, gameStates.isOnTheGround);
  });
  return null;
}

function FieldButton({ disabled }: { disabled: boolean }) {
  const { teleport } = useTeleport();
  return <button type="button" disabled={disabled} onClick={() => {
    const destination = TELEPORT_POINTS.find((point) => point.id === 'north-field');
    if (destination) teleport(teleportDestinationToVector3(destination));
  }}>북쪽 들판으로</button>;
}

export default function AutomationPage() {
  const automation = useGaesupStore((state) => state.automation);
  const [position, setPosition] = useState(() => new Vector3());
  const [grounded, setGrounded] = useState(false);
  const [ready, setReady] = useState(false);
  const [executionStart, setExecutionStart] = useState<{ completed: number; errors: number } | null>(null);
  const handleRuntimeReady = useCallback(() => setReady(true), []);
  const { isRunning, isPaused } = automation.queue;
  const completed = executionStart ? automation.executionStats.totalExecuted - executionStart.completed : 0;
  const finished = completed > 0 && completed === automation.queue.actions.length;
  const failed = !finished && executionStart ? automation.executionStats.errors.length > executionStart.errors : false;

  useEffect(() => () => useGaesupStore.getState().stopAutomation(), []);
  const handlePositionChange = useCallback((next: Vector3, onGround: boolean) => {
    setPosition((previous) => previous.equals(next) ? previous : next.clone());
    setGrounded(onGround);
  }, []);

  const handleStart = () => {
    const store = useGaesupStore.getState();
    store.stopAutomation();
    store.clearAutomationQueue();
    const stats = useGaesupStore.getState().automation.executionStats;
    setExecutionStart({ completed: stats.totalExecuted, errors: stats.errors.length });
    store.addAutomationAction({ type: 'move', target: new Vector3(position.x + MOVE_DISTANCE, 0, position.z) });
    store.addAutomationAction({ type: 'wait', duration: WAIT_DURATION_MS });
    store.addAutomationAction({ type: 'move', target: new Vector3(position.x, 0, position.z) });
    store.startAutomation();
  };

  const actionLabel = automation.currentAction?.type === 'wait' ? '대기 중' : '이동 중';
  const idleLabel = !executionStart ? '실행 준비' : finished ? '완료' : failed ? '이동 실패' : '중지됨';

  return (
    <WorldPage showHud compactHud onRuntimeReady={handleRuntimeReady} sceneChildren={<PositionProbe onChange={handlePositionChange} />} overlayChildren={
      <section className="automation-example" aria-label="이동 자동화">
        <h1>이동 자동화</h1>
        <p>현재 위치에서 동쪽으로 4m 이동하고, 2초 기다린 뒤 돌아옵니다.</p>
        <p>단차나 장애물이 있다면 먼저 북쪽 들판으로 이동하세요.</p>
        <output aria-live="polite">{isPaused ? '일시정지' : isRunning ? actionLabel : idleLabel} · 완료한 동작 {completed}개</output>
        {failed && <p role="status">{isRunning
          ? '이동이 지연되어 다시 시도하고 있습니다.'
          : '이동을 완료하지 못했습니다. 장애물 없는 곳에서 다시 실행해 주세요.'}</p>}
        <p className="automation-example__position">현재 위치: X {position.x.toFixed(2)} / Z {position.z.toFixed(2)}</p>
        <div className="automation-example__actions">
          <FieldButton disabled={!ready || isRunning} />
          <button type="button" onClick={handleStart} disabled={!ready || isRunning || !grounded}>순서 실행</button>
          <button type="button" disabled={!isRunning} onClick={() => {
            const store = useGaesupStore.getState();
            if (isPaused) store.resumeAutomation();
            else store.pauseAutomation();
          }}>{isPaused ? '재개' : '일시정지'}</button>
          <button type="button" disabled={!isRunning} onClick={() => useGaesupStore.getState().stopAutomation()}>중지</button>
        </div>
      </section>
    } />
  );
}
