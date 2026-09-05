import { useState } from 'react';

import { Link } from 'react-router-dom';

import { EXAMPLE_ROUTES } from '../config/exampleRoutes';
import './styles/ExampleCatalogPage.css';

const EXAMPLE_GROUPS = [
  { audience: 'product', label: '먼저 체험해보세요' },
  { audience: 'developer', label: '개발 도구와 호환 예제' },
] as const;

export function ExampleCatalogPage() {
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState('');
  const [query, setQuery] = useState('');
  const search = query.trim().toLocaleLowerCase();
  const matches = EXAMPLE_ROUTES.filter((example) =>
    `${example.label} ${example.description} ${example.category} ${example.path}`
      .toLocaleLowerCase()
      .includes(search),
  );
  const handleCheckPackage = async () => {
    if (checking) return;
    setChecking(true);
    setCheckResult('패키지 연결 확인 중…');
    try {
      const { createPackageSurfaceExample } = await import('../packageSurface');
      const example = createPackageSurfaceExample();
      await example.runtime.dispose();
      setCheckResult('런타임과 카메라·이동 프리셋을 생성했습니다.');
    } catch {
      setCheckResult('패키지 연결을 확인하지 못했습니다. 다시 시도하세요.');
    } finally {
      setChecking(false);
    }
  };
  return (
    <main className="example-catalog-page">
      <header className="example-catalog-page__header">
        <p className="example-catalog-page__eyebrow">개발자 도구</p>
        <h1 className="example-catalog-page__title">전체 예제</h1>
        <p className="example-catalog-page__description">
          기본 체험부터 편집 도구, 성능 실험, 기존 버전 호환 화면까지 필요한 예제를 선택하세요.
        </p>
        <label className="example-catalog-page__search">
          예제 찾기
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="이름, 기능 또는 경로 검색"
          />
        </label>
        {search && <p aria-live="polite">검색 결과 {matches.length}개</p>}
        <div className="example-catalog-page__check">
          <button
            type="button"
            className="gp-btn"
            disabled={checking}
            onClick={() => {
              void handleCheckPackage();
            }}
          >
            패키지 연결 확인
          </button>
          <span role="status">{checkResult}</span>
        </div>
      </header>
      {EXAMPLE_GROUPS.map((group) => {
        const examples = matches.filter((example) => example.audience === group.audience);
        if (examples.length === 0) return null;
        return (
          <section
            key={group.audience}
            className="example-catalog-page__group"
            aria-label={group.label}
          >
            <h2>{group.label}</h2>
            <div className="example-catalog-page__grid">
              {examples.map((example) => (
                <Link key={example.path} to={example.path} className="example-catalog-card">
                  <span className="example-catalog-card__category">{example.category}</span>
                  <strong className="example-catalog-card__label">{example.label}</strong>
                  <span className="example-catalog-card__description">{example.description}</span>
                  {example.audience === 'developer' && (
                    <span className="example-catalog-card__path">{example.path}</span>
                  )}
                </Link>
              ))}
            </div>
          </section>
        );
      })}
      {matches.length === 0 && (
        <p className="example-catalog-page__empty">
          일치하는 예제가 없습니다. 다른 단어로 검색해보세요.
        </p>
      )}
    </main>
  );
}
