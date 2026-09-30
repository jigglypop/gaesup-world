import { useMemo } from 'react';

import { describePrefabOverride } from './describe';
import type { PrefabInstanceViewProps } from './types';
import { computePrefabOverrides, getPrefabInstanceObjects, readPrefabInstanceLink } from '../../../../prefab';

export function PrefabInstanceView({
  document,
  object,
  prefabs,
  onCreate,
  onRevertOverride,
  onRevertAll,
  onApply,
}: PrefabInstanceViewProps) {
  const link = useMemo(() => readPrefabInstanceLink(object), [object]);
  const prefab = link ? prefabs.find((candidate) => candidate.id === link.prefabId) : undefined;
  const overrides = useMemo(
    () => (link && prefab ? computePrefabOverrides(prefab, getPrefabInstanceObjects(document.objects, link), link) : []),
    [document, link, prefab],
  );

  if (!link) {
    if (!onCreate) return null;
    return (
      <section className="prop-group">
        <h4 className="prop-group-title">프리팹</h4>
        <button type="button" onClick={() => onCreate(object.id)}>프리팹으로 만들기</button>
      </section>
    );
  }

  if (!prefab) {
    return (
      <section className="prop-group">
        <h4 className="prop-group-title">프리팹</h4>
        <div className="inspector-component-empty">원본 프리팹을 찾을 수 없습니다 ({link.prefabId})</div>
      </section>
    );
  }

  return (
    <section className="prop-group">
      <div className="inspector-section-header">
        <h4 className="prop-group-title">프리팹 · {prefab.name}</h4>
        <span className="object-tag">{overrides.length}</span>
      </div>
      <div className="inspector-component-list">
        {overrides.length === 0 ? (
          <div className="inspector-component-empty">원본과 같습니다</div>
        ) : overrides.map((override, index) => (
          <div className="prop-item" key={`${override.kind}-${index}`}>
            <span className="prop-label">{describePrefabOverride(prefab, override)}</span>
            {onRevertOverride && (
              <button type="button" onClick={() => onRevertOverride(object.id, prefab, override)}>되돌리기</button>
            )}
          </div>
        ))}
      </div>
      <div className="inspector-add-component">
        {onRevertAll && (
          <button type="button" disabled={overrides.length === 0} onClick={() => onRevertAll(object.id, prefab)}>
            모두 되돌리기
          </button>
        )}
        {onApply && (
          <button type="button" disabled={overrides.length === 0} onClick={() => onApply(object.id, prefab)}>
            프리팹에 적용
          </button>
        )}
      </div>
    </section>
  );
}
