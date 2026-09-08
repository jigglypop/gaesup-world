import { useEffect, useState } from 'react';

import type { ProductionActionsProps, StudioJob } from './types';
import './styles.css';

const API = 'http://127.0.0.1:5190';
async function request(route: string, body?: unknown): Promise<unknown> {
  const response = await fetch(`${API}${route}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Asset-Studio': '1' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    signal: AbortSignal.timeout(210000),
  });
  const result: unknown = await response.json();
  if (!response.ok)
    throw new Error(
      typeof result === 'object' && result && 'error' in result
        ? String(result.error)
        : '요청 실패',
    );
  return result;
}

export function ProductionActions({
  stage,
  prompt,
  reference,
  onReference,
}: ProductionActionsProps) {
  const [connection, setConnection] = useState<{ meshy: boolean; blender: boolean }>();
  const [jobs, setJobs] = useState<StudioJob[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [paid, setPaid] = useState(false);
  const [approved, setApproved] = useState(false);
  const [reviewer, setReviewer] = useState('');
  const [category, setCategory] = useState('sofa');
  useEffect(() => {
    setApproved(false);
    setPaid(false);
  }, [reference, category, stage]);
  const refresh = async () => {
    const health = await request('/health');
    if (!health || typeof health !== 'object' || !('meshy' in health) || !('blender' in health))
      throw new Error('잘못된 서버 응답');
    setConnection({ meshy: health.meshy === true, blender: health.blender === true });
    const next = await request('/jobs');
    if (!Array.isArray(next)) throw new Error('잘못된 작업 목록');
    setJobs(next as StudioJob[]);
  };
  const run = async (operation: () => Promise<void>) => {
    if (busy) return;
    setBusy(true);
    setMessage('');
    try {
      await operation();
      await refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '로컬 서버 연결 실패');
    } finally {
      setBusy(false);
      setPaid(false);
    }
  };
  const handleGenerate = () =>
    run(async () => {
      if (stage === 'concept') {
        await request('/image', { id: crypto.randomUUID(), prompt, confirmPaid: paid });
      } else {
        if (!reference) throw new Error('이미지 · 콘셉트 단계에서 레퍼런스를 선택하세요.');
        const bytes = new Uint8Array(await reference.arrayBuffer());
        let binary = '';
        for (const byte of bytes) binary += String.fromCharCode(byte);
        await request('/model', {
          category,
          image: btoa(binary),
          confirmPaid: paid,
          approved,
          reviewer,
        });
      }
      setMessage(
        '요청을 기록했습니다. 작업 상태 조회로 결과를 확인하세요. 불명확한 요청은 재생성하지 마세요.',
      );
    });
  return (
    <section className="production-actions" aria-label="로컬 제작 실행">
      <h3>실제 제작 실행</h3>
      <p>
        로컬 서버: <code>corepack pnpm assets:studio</code> · 작업실 주소는 127.0.0.1:5188을
        사용합니다.
      </p>
      <button
        disabled={busy}
        onClick={() => {
          void run(refresh);
        }}
      >
        연결 확인 · 작업 새로고침
      </button>
      {connection && (
        <p>
          Meshy: {connection.meshy ? '키 설정됨 (인증 미검증)' : 'MESHY_API_KEY 미설정'} · Blender:{' '}
          {connection.blender ? '실행 파일 감지됨' : '실행 파일 없음'}
        </p>
      )}
      {(stage === 'concept' || stage === 'model') && (
        <>
          {stage === 'concept' ? (
            <p>
              Meshy 이미지 생성 · nano-banana-2 · 텍스트만 전송합니다. 레퍼런스 이미지를 편집하는
              기능은 아닙니다.
            </p>
          ) : (
            <>
              <label>
                제작 종류
                <select value={category} onChange={(event) => setCategory(event.target.value)}>
                  {[
                    ['chair', '의자'],
                    ['table', '테이블'],
                    ['sofa', '소파'],
                    ['planter', '화분'],
                    ['tree', '나무'],
                  ].map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <p>
                선택 이미지: {reference?.name ?? '없음'} · 종류별 최대 2개. 캐릭터 제작은 Blender
                경로입니다.
              </p>
              <label>
                레퍼런스 승인자
                <input value={reviewer} onChange={(event) => setReviewer(event.target.value)} />
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={approved}
                  onChange={(event) => setApproved(event.target.checked)}
                />
                선택 이미지를 이 종류의 3D 제작 레퍼런스로 승인합니다.
              </label>
            </>
          )}
          <label>
            <input
              type="checkbox"
              checked={paid}
              onChange={(event) => setPaid(event.target.checked)}
            />
            Meshy에 {stage === 'concept' ? '프롬프트' : '선택 이미지'}를 전송하고 유료 작업 1회를
            요청합니다.
          </label>
          <button
            disabled={
              busy ||
              !connection?.meshy ||
              !paid ||
              (stage === 'concept' ? !prompt.trim() : !reference || !approved || !reviewer.trim())
            }
            onClick={() => {
              void handleGenerate();
            }}
          >
            {busy ? '처리 중…' : stage === 'concept' ? '이미지 생성 요청' : '3D 후보 생성 요청'}
          </button>
        </>
      )}
      {message && <p role="status">{message}</p>}
      <ul>
        {jobs.map((job) => (
          <li key={`${job.kind}:${job.id}`}>
            <strong>
              {job.kind === 'image' ? '이미지' : '3D'} · {job.id}
            </strong>
            <span>{job.state}</span>
            {job.taskId && job.state !== 'downloaded' && (
              <button
                disabled={busy}
                onClick={() => {
                  void run(async () => {
                    await request(`/${job.kind === 'image' ? 'image' : 'model'}/resume`, {
                      id: job.id,
                    });
                  });
                }}
              >
                작업 상태 조회 · 결과 받기
              </button>
            )}
            {job.kind === 'image' && job.artifact && (
              <button
                disabled={busy}
                onClick={() => {
                  void run(async () => {
                    const result = await request('/image/read', { id: job.id });
                    if (
                      !result ||
                      typeof result !== 'object' ||
                      !('image' in result) ||
                      typeof result.image !== 'string'
                    )
                      throw new Error('이미지 응답 오류');
                    const blob = await (await fetch(result.image)).blob();
                    onReference(new File([blob], 'meshy-reference.png', { type: 'image/png' }));
                    setApproved(false);
                    setMessage(
                      '생성 이미지를 레퍼런스로 선택했습니다. 콘셉트 단계에서 확인하세요.',
                    );
                  });
                }}
              >
                레퍼런스로 선택
              </button>
            )}
            {job.kind === 'model' && job.artifact && (
              <button
                disabled={busy || !connection?.blender}
                onClick={() => {
                  void run(async () => {
                    await request('/blender', { id: job.id });
                    setMessage(
                      'Blender에서 후보를 가져와 .blend와 preview.glb를 저장했습니다. 리깅 승인은 별도입니다.',
                    );
                  });
                }}
              >
                Blender 가져오기 · GLB 저장
              </button>
            )}
            {job.blender && <small>저장 위치: .asset-work/{job.blender.output}</small>}
          </li>
        ))}
      </ul>
    </section>
  );
}
