import { useMemo, useState } from 'react';

import type { EditorPanelBaseProps } from './types';
import type {
  CreateSceneComponentInput,
  SceneComponent,
  SceneDocument,
  SceneObject,
  SceneObjectId,
  SceneTransform,
} from '../../../scene-object';

export type SceneObjectPatch = Partial<Pick<SceneObject, 'name' | 'tags'>> & {
  layer?: string | undefined;
  transform?: Partial<SceneTransform>;
};

export type InspectorPanelProps = EditorPanelBaseProps & {
  sceneDocument?: SceneDocument;
  selectedObjectId?: SceneObjectId;
  selectedObject?: SceneObject;
  emptyLabel?: string;
  onUpdateObject?: (objectId: SceneObjectId, patch: SceneObjectPatch) => void;
  onAddComponent?: (objectId: SceneObjectId, component: CreateSceneComponentInput) => void;
  onRemoveComponent?: (objectId: SceneObjectId, componentId: string) => void;
};

type VectorKey = keyof SceneTransform;

const VECTOR_LABELS = ['X', 'Y', 'Z'] as const;

export function InspectorPanel({
  sceneDocument,
  selectedObjectId,
  selectedObject,
  emptyLabel = '장면에서 객체를 선택하세요',
  onUpdateObject,
  onAddComponent,
  onRemoveComponent,
  className = '',
  style,
  children,
}: InspectorPanelProps = {}) {
  const object = useMemo(
    () => selectedObject ?? sceneDocument?.objects.find((entry) => entry.id === selectedObjectId),
    [sceneDocument, selectedObject, selectedObjectId],
  );
  const [newComponentType, setNewComponentType] = useState('');

  if (!object) {
    return (
      <div className={`inspector-panel empty ${className}`} style={style}>
        {emptyLabel}
        {children}
      </div>
    );
  }

  const updateTransformVector = (key: VectorKey, index: number, value: number) => {
    const nextVector = [...object.transform[key]] as [number, number, number];
    nextVector[index] = value;
    onUpdateObject?.(object.id, { transform: { [key]: nextVector } });
  };

  const addComponent = () => {
    const type = newComponentType.trim();
    if (!type) return;
    onAddComponent?.(object.id, { type, data: {} });
    setNewComponentType('');
  };

  return (
    <div className={`inspector-panel inspector-panel--scene-object ${className}`} style={style}>
      <div className="inspector-header">
        <h3>{object.name || object.id}</h3>
        <span className="object-tag">{object.id}</span>
      </div>

      <section className="prop-group">
        <h4 className="prop-group-title">객체</h4>
        <TextProperty
          label="이름"
          value={object.name}
          onChange={(name) => onUpdateObject?.(object.id, { name })}
        />
        <TextProperty
          label="레이어"
          value={object.layer ?? ''}
          onChange={(layer) => onUpdateObject?.(object.id, { layer: layer || undefined })}
        />
        <label className="prop-item">
          <span className="prop-label">태그</span>
          <span className="prop-value">
            <input
              key={JSON.stringify([object.id, object.tags])}
              type="text"
              defaultValue={object.tags.join(', ')}
              placeholder="쉼표로 구분해서 입력"
              onBlur={(event) => {
                const tags = event.target.value.split(',').map((tag) => tag.trim()).filter(Boolean);
                event.target.value = tags.join(', ');
                if (tags.length !== object.tags.length || tags.some((tag, index) => tag !== object.tags[index])) {
                  onUpdateObject?.(object.id, { tags });
                }
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.nativeEvent.isComposing) event.currentTarget.blur();
              }}
            />
          </span>
        </label>
        <ReadOnlyProperty label="상위 객체" value={object.parentId ?? '최상위'} />
      </section>

      <section key={object.id} className="prop-group">
        <h4 className="prop-group-title">위치·회전·크기</h4>
        <VectorProperty
          label="위치"
          value={object.transform.position}
          onChange={(index, value) => updateTransformVector('position', index, value)}
        />
        <VectorProperty
          label="회전 (라디안)"
          value={object.transform.rotation}
          onChange={(index, value) => updateTransformVector('rotation', index, value)}
        />
        <VectorProperty
          label="배율"
          value={object.transform.scale}
          onChange={(index, value) => updateTransformVector('scale', index, value)}
        />
      </section>

      <section className="prop-group">
        <div className="inspector-section-header">
          <h4 className="prop-group-title">구성 요소</h4>
          <span className="object-tag">{object.components.length}</span>
        </div>
        <div className="inspector-component-list">
          {object.components.length === 0 ? (
            <div className="inspector-component-empty">구성 요소가 없습니다</div>
          ) : object.components.map((component) => (
            <ComponentRow
              key={component.id}
              component={component}
              onRemove={() => onRemoveComponent?.(object.id, component.id)}
            />
          ))}
        </div>
        <div className="inspector-add-component">
          <input
            type="text"
            value={newComponentType}
            onChange={(event) => setNewComponentType(event.target.value)}
            placeholder="구성 요소 유형 (예: game.health)"
            aria-label="새 구성 요소 유형"
          />
          <button type="button" onClick={addComponent} disabled={!newComponentType.trim()}>
            추가
          </button>
        </div>
      </section>

      {children}
    </div>
  );
}

function TextProperty({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="prop-item">
      <span className="prop-label">{label}</span>
      <span className="prop-value">
        <input type="text" value={value} onChange={(event) => onChange(event.target.value)} />
      </span>
    </label>
  );
}

function ReadOnlyProperty({ label, value }: { label: string; value: string }) {
  return (
    <div className="prop-item">
      <span className="prop-label">{label}</span>
      <span className="prop-value prop-value--readonly">{value}</span>
    </div>
  );
}

function VectorProperty({
  label,
  value,
  onChange,
}: {
  label: string;
  value: readonly [number, number, number];
  onChange: (index: number, value: number) => void;
}) {
  return (
    <div className="prop-item">
      <span className="prop-label">{label}</span>
      <span className="prop-value vector-input">
        {value.map((entry, index) => (
          <label key={`${label}-${VECTOR_LABELS[index]}`} className="vector-input__field">
            <span>{VECTOR_LABELS[index]}</span>
            <input
              key={entry}
              type="number"
              step="any"
              aria-label={`${label} ${VECTOR_LABELS[index]}`}
              defaultValue={entry}
              onBlur={(event) => {
                const next = event.currentTarget.valueAsNumber;
                if (!Number.isFinite(next)) {
                  event.currentTarget.value = String(entry);
                  return;
                }
                if (next !== entry) onChange(index, next);
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.nativeEvent.isComposing) event.currentTarget.blur();
              }}
            />
          </label>
        ))}
      </span>
    </div>
  );
}

function ComponentRow({
  component,
  onRemove,
}: {
  component: SceneComponent;
  onRemove: () => void;
}) {
  return (
    <article className="inspector-component">
      <header className="inspector-component__header">
        <div>
          <strong>{component.type}</strong>
          <span>{component.id}</span>
        </div>
        <button type="button" onClick={onRemove}>삭제</button>
      </header>
      <pre>{JSON.stringify(component.data, null, 2)}</pre>
    </article>
  );
}
