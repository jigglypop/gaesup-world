import { useEffect, useRef, useState } from 'react';

import type { SceneDocumentController } from 'gaesup-world';

import { mountMiniroom } from './room';
import type { RoomView } from './room';

export default function Miniroom({
  controller,
  view,
  onSelect,
}: {
  controller: SceneDocumentController;
  view: RoomView;
  onSelect: (id: string | null) => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const engine = useRef<Awaited<ReturnType<typeof mountMiniroom>>>(null);
  const latestView = useRef(view);
  latestView.current = view;
  const [backend, setBackend] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    if (!canvas.current) return;
    const abort = new AbortController();
    void mountMiniroom(canvas.current, controller, onSelect, setBackend, abort.signal)
      .then((instance) => {
        if (abort.signal.aborted) {
          instance?.dispose();
          return;
        }
        engine.current = instance;
        instance?.update(latestView.current);
      })
      .catch((failure: unknown) => {
        if (!abort.signal.aborted)
          setError(failure instanceof Error ? failure.message : String(failure));
      });
    return () => {
      abort.abort();
      engine.current = null;
    };
  }, [controller, onSelect]);
  useEffect(() => {
    engine.current?.update(view);
  }, [view]);
  return (
    <div className="miniroom-view" data-renderer={backend || 'loading'}>
      <canvas ref={canvas} aria-label="나의 3D 미니룸. 바닥을 클릭하면 미니미가 이동합니다." />
      {!backend && !error && <div className="room-loading">작은 방에 햇살을 들이는 중…</div>}
      {error && (
        <div className="room-loading" role="alert">
          방을 열지 못했습니다. {error}
          <button onClick={() => location.reload()}>다시 열기</button>
        </div>
      )}
      <div className="room-badge">
        <span /> MY LITTLE ROOM
      </div>
      <button
        className="reset-camera"
        onClick={() => engine.current?.resetCamera()}
        aria-label="미니룸 시점 초기화"
      >
        ⌂
      </button>
      <div className="room-caption">
        {view.editing
          ? '가구를 클릭하고 드래그해서 옮겨보세요'
          : '바닥을 클릭하면 미니미가 걸어가요'}
        <span>오른쪽 드래그로 둘러보기</span>
      </div>
    </div>
  );
}
