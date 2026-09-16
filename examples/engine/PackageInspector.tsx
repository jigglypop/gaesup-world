import { useState } from 'react';

export default function PackageInspector() {
  const [state, setState] = useState('');
  const [modules, setModules] = useState<{ name: string; exports: number }[]>([]);
  async function inspect() {
    setState('공개 패키지를 불러오는 중…');
    try {
      const { inspectPackageSurface } = await import('./packageSurface');
      setModules(await inspectPackageSurface());
      setState('공개 모듈 로드 완료');
    } catch (error) {
      setState(error instanceof Error ? error.message : String(error));
    }
  }
  return (
    <div className="package-inspector">
      <button onClick={() => void inspect()}>공개 패키지 API 확인</button>
      <p role="status">{state}</p>
      {modules.length > 0 && (
        <dl className="metrics">
          {modules.map((module) => (
            <div key={module.name}>
              <dt>{module.name}</dt>
              <dd>{module.exports} exports</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
