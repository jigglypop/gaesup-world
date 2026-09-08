import { useEffect, useState } from 'react';

import { Link, useSearchParams } from 'react-router-dom';

import { AssetCatalogPanel } from '../components/assets/AssetCatalogPanel';
import { ProductionActions } from '../components/assets/ProductionActions';
import './styles/AssetsPage.css';

const STAGES = [
  {
    id: 'concept',
    title: '이미지 · 콘셉트',
    subtitle: '캐릭터의 첫인상',
    status: '레퍼런스 정리',
    heading: '작은 토끼에서 시작하는, 나만의 캐릭터.',
    description:
      '크림과 연분홍, 둥근 볼과 큰 눈. 기본형을 정하고 모자·의상·가방을 따로 설계합니다.',
    input: '토끼 SD 레퍼런스 · 색감 · 정면과 측면',
    output: '기본형 이미지 · 파츠별 제작 브리프',
    checks: [
      '약 2등신의 둥근 실루엣',
      '모자 없이도 읽히는 얼굴과 헤어',
      '토끼 모자·가방·착장은 교체 파츠',
    ],
    note: '로컬 제작 서버를 연결하면 Meshy 텍스트 이미지 생성을 요청할 수 있습니다. 레퍼런스 편집이 아닌 텍스트 기반 생성이며 결과는 별도 승인이 필요합니다.',
  },
  {
    id: 'model',
    title: '3D · 모델 제작',
    subtitle: '이미지를 입체적인 형태로',
    status: '로컬 도구',
    heading: '예쁜 이미지에서, 쓸 수 있는 3D로.',
    description: '캐릭터와 집은 Blender에서 제작하고, 가구·나무 후보는 승인된 이미지로 생성합니다.',
    input: '승인된 레퍼런스 이미지',
    output: '원본 모델 · 정리된 메시 · 제작 출처',
    checks: [
      '캐릭터·리그는 Blender 제작',
      'Meshy 후보는 종류별 최대 2개',
      '원본 보관과 납품 파일 분리',
    ],
    note: '승인한 이미지를 로컬 서버를 통해 Meshy에 전송합니다. 작업 ID를 저장하고 조회로 재개하며 API 키는 서버 환경변수에서만 읽습니다.',
  },
  {
    id: 'rig',
    title: '리깅 · 움직임',
    subtitle: '걷고, 뛰고, 앉는 캐릭터',
    status: '제작 대기',
    heading: '표정과 움직임까지, 하나의 캐릭터로.',
    description: '몸과 교체 착장이 같은 리그를 사용하도록 맞추고 실제 플레이 동작을 검수합니다.',
    input: '정리된 몸·헤어·착장 메시',
    output: 'gaesup-mascot-v1 리그 · 기본 동작 5종',
    checks: [
      'idle · walk · run · jump · sit',
      '손·발·머리 소켓과 착장 호환',
      '의자 높이·충돌체·카메라 기준 일치',
    ],
    note: '새 토끼 캐릭터 메시와 리그는 아직 제작 전입니다. 기존 리그를 새 리그 완료로 표시하지 않습니다.',
  },
  {
    id: 'quality',
    title: '최적화 · 품질 검수',
    subtitle: '실제 화면에서 확인하기',
    status: '검수 도구 사용 가능',
    heading: '가까이서도, 플레이 거리에서도.',
    description: '재질과 실루엣을 비교하고 기본 압축본과 대체본을 각각 확인합니다.',
    input: 'manifest.json · 납품 GLB 파일',
    output: '파일 해시에 연결된 검수 기록',
    checks: [
      'LOD 0 / 1 / 2 · 회색 실루엣 비교',
      'Meshopt 압축본과 대체본 로딩',
      '아트 승인과 브라우저 측정 분리',
    ],
    note: '검수 화면과 Meshopt 경로를 사용할 수 있습니다. KTX2와 새 캐릭터 성능 검증은 미완료입니다.',
  },
  {
    id: 'publish',
    title: '납품 · 공개',
    subtitle: '검증된 에셋만 월드로',
    status: '승인 대기',
    heading: '검증을 마친 에셋만, 월드에.',
    description: '출처·기술·아트·브라우저 검증을 충족한 버전만 제품 카탈로그에 공개합니다.',
    input: '납품 파일 · 네 가지 승인 증거',
    output: '고정된 버전 · 공개 카탈로그',
    checks: [
      '출처 승인 + 기술 검사 통과',
      '사용자 아트 승인 + 브라우저 검증',
      '파일 변경 시 관련 승인 갱신',
    ],
    note: '승인된 새 제품 에셋은 아직 없습니다. 기존 라이브러리는 제품 품질 승인을 의미하지 않습니다.',
  },
] as const;

export function AssetsPage() {
  const [params, setParams] = useSearchParams();
  const [name, setName] = useState('토끼 SD 기본형');
  const [direction, setDirection] = useState<string>(STAGES[0].description);
  const [reference, setReference] = useState<File>();
  const [preview, setPreview] = useState('');
  const [referenceError, setReferenceError] = useState('');
  useEffect(() => {
    if (!reference) {
      setPreview('');
      return;
    }
    const url = URL.createObjectURL(reference);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [reference]);
  const stage = STAGES.find((entry) => entry.id === params.get('stage')) ?? STAGES[0];
  const index = STAGES.indexOf(stage);
  const handleBriefDownload = () => {
    if (!name.trim() || !direction.trim()) return;
    const brief = {
      name: name.trim(),
      direction: direction.trim(),
      referenceFile: reference?.name,
      requirements: STAGES[0].checks,
      status: 'brief-only-not-art-approved',
    };
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(brief, null, 2)], { type: 'application/json' }),
    );
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'bunny-character-brief.json';
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <main className="example-assets-page">
      <header className="example-assets-page__header">
        <p className="example-assets-page__eyebrow">ASSET STUDIO / 제작 작업실</p>
        <h1>상상에서, 플레이까지.</h1>
        <p>이미지부터 움직임과 납품까지. 한 단계씩 완성하는 캐릭터와 에셋.</p>
      </header>
      <div className="asset-studio__workspace">
        <nav className="asset-studio__steps" aria-label="에셋 제작 단계">
          <p>제작 흐름</p>
          {STAGES.map((entry, position) => (
            <button
              key={entry.id}
              aria-current={stage.id === entry.id ? 'step' : undefined}
              onClick={() => setParams({ stage: entry.id })}
            >
              <span className="asset-studio__number">0{position + 1}</span>
              <span>
                <strong>{entry.title}</strong>
                <small>{entry.subtitle}</small>
              </span>
            </button>
          ))}
          <a href="#legacy-library">기존 에셋 라이브러리 ↗</a>
        </nav>
        <section className="asset-studio__detail" aria-labelledby="stage-heading">
          <div className="asset-studio__meta">
            <span>STEP 0{index + 1} / 05</span>
            <span className="asset-studio__badge">{stage.status}</span>
          </div>
          <h2 id="stage-heading">{stage.heading}</h2>
          <p className="asset-studio__description">{stage.description}</p>
          {stage.id === 'concept' && (
            <div className="asset-studio__brief">
              <label>
                캐릭터 이름
                <input
                  value={name}
                  maxLength={100}
                  onChange={(event) => setName(event.target.value)}
                />
              </label>
              <label>
                제작 방향
                <textarea
                  value={direction}
                  maxLength={4000}
                  onChange={(event) => setDirection(event.target.value)}
                />
              </label>
              <label>
                레퍼런스 이미지
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    if (
                      !['image/png', 'image/jpeg', 'image/webp'].includes(file.type) ||
                      file.size > 10 * 1024 * 1024
                    ) {
                      setReferenceError('PNG·JPEG·WebP, 10MiB 이하의 이미지를 선택하세요.');
                      return;
                    }
                    setReference(file);
                    setReferenceError('');
                  }}
                />
              </label>
              <small>
                로컬 미리보기 전용 · 서버 전송 없음. 새로고침 전 브리프를 저장하세요. 이미지 원본은
                별도로 보관하세요.
              </small>
              {referenceError && <p role="alert">{referenceError}</p>}
              {preview && (
                <figure>
                  <img
                    src={preview}
                    alt="선택한 캐릭터 제작 레퍼런스"
                    onError={() => {
                      setReferenceError('이미지를 읽을 수 없습니다. 다른 파일을 선택하세요.');
                      setReference(undefined);
                    }}
                  />
                  <figcaption>{reference?.name}</figcaption>
                  <button onClick={() => setReference(undefined)}>레퍼런스 제거</button>
                </figure>
              )}
            </div>
          )}
          <ProductionActions
            stage={stage.id}
            prompt={direction}
            reference={reference}
            onReference={setReference}
          />
          <div className="asset-studio__contract">
            <div>
              <small>준비할 것</small>
              <p>{stage.input}</p>
            </div>
            <div>
              <small>이 단계의 결과물</small>
              <p>{stage.output}</p>
            </div>
          </div>
          <h3>완성 기준</h3>
          <ul>
            {stage.checks.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="asset-studio__notice">{stage.note}</p>
          <div className="asset-studio__actions">
            {stage.id === 'concept' && (
              <button disabled={!name.trim() || !direction.trim()} onClick={handleBriefDownload}>
                토끼 캐릭터 브리프 저장 ↓
              </button>
            )}
            {stage.id === 'quality' && <Link to="/asset-review">GLB 검수 화면 열기 ↗</Link>}
            {stage.id === 'publish' && <Link to="/world">현재 월드 확인 ↗</Link>}
            {index < STAGES.length - 1 && (
              <button
                className="asset-studio__secondary"
                onClick={() => setParams({ stage: STAGES[index + 1]!.id })}
              >
                다음 단계 살펴보기 →
              </button>
            )}
          </div>
        </section>
      </div>
      <section id="legacy-library" className="asset-studio__library">
        <h2>
          기존 에셋 라이브러리 <span>LEGACY</span>
        </h2>
        <p>현재 월드에서 사용하는 에셋입니다. 새 제작 에셋의 승인 상태와는 별개입니다.</p>
        <AssetCatalogPanel mode="page" />
      </section>
    </main>
  );
}
