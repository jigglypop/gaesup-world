import React, { useState, useMemo, useCallback, useEffect } from 'react';

import { logger } from '@/core/utils/logger';

import { BLUEPRINT_FIELD_LABELS, BLUEPRINT_TAG_LABELS, BLUEPRINT_TYPE_LABELS } from './defaults';
import {
  BlueprintType,
  BlueprintCategory,
  BlueprintEditorProps,
} from './types';
import { blueprintRegistry, AnyBlueprint } from '../../';
import { CAMERA_CONTROLLER_DEFAULT_MODES } from '../../../core/camera/components/CameraController/defaults';
import { useSpawnFromBlueprint } from '../../hooks/useSpawnFromBlueprint';
import type { BlueprintRecord, BlueprintValue } from '../../types';
import { BlueprintPreview } from '../BlueprintPreview';
import type { BlueprintFieldValue } from '../panels/BlueprintPanel/types';
import {
  convertBlueprintToItem,
} from '../panels/BlueprintPanel/utils';
import './styles.css';

const isRecord = (value: BlueprintValue | undefined): value is BlueprintRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const setNestedProperty = (
  target: BlueprintRecord,
  path: string[],
  value: BlueprintFieldValue,
): boolean => {
  if (path.length === 0) return false;

  let current: BlueprintRecord | BlueprintValue[] | BlueprintValue | undefined = target;

  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    if (!key) return false;

    if (Array.isArray(current)) {
      const index = Number(key);
      if (!Number.isInteger(index) || index < 0 || index >= current.length) return false;
      const child: BlueprintValue | undefined = current[index];
      const copy: BlueprintRecord | BlueprintValue[] | undefined = Array.isArray(child) ? [...child] : isRecord(child) ? { ...child } : undefined;
      if (!copy) return false;
      current[index] = copy;
      current = copy;
      continue;
    }

    if (!isRecord(current)) return false;
    const child: BlueprintValue | undefined = current[key];
    const copy: BlueprintRecord | BlueprintValue[] | undefined = Array.isArray(child) ? [...child] : isRecord(child) ? { ...child } : undefined;
    if (!copy) return false;
    current[key] = copy;
    current = copy;
  }

  const lastKey = path[path.length - 1];
  if (!lastKey) return false;

  if (Array.isArray(current)) {
    const index = Number(lastKey);
    if (!Number.isInteger(index) || index < 0 || index >= current.length) return false;
    current[index] = value;
    return true;
  }

  if (!isRecord(current)) return false;
  current[lastKey] = value;
  return true;
};

const blueprintCategories: BlueprintCategory[] = [
  { id: 'characters', name: '캐릭터', type: 'character', count: 0 },
  { id: 'vehicles', name: '차량', type: 'vehicle', count: 0 },
  { id: 'airplanes', name: '비행기', type: 'airplane', count: 0 },
  { id: 'animations', name: '애니메이션', type: 'animation', count: 0 },
  { id: 'behaviors', name: '행동', type: 'behavior', count: 0 },
  { id: 'items', name: '아이템', type: 'item', count: 0 },
];

export const BlueprintEditor: React.FC<BlueprintEditorProps> = ({ onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<BlueprintType>('character');
  const [selectedBlueprint, setSelectedBlueprint] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingBlueprint, setEditingBlueprint] = useState<AnyBlueprint | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  const { spawnAtCursor, isSpawning } = useSpawnFromBlueprint();
  const [spawnFailed, setSpawnFailed] = useState(false);

  const [allBlueprints, setAllBlueprints] = useState(() => {
    return blueprintRegistry.getAll().map(convertBlueprintToItem);
  });

  const categoriesWithCounts = useMemo(() => {
    const counts: Record<BlueprintType, number> = {
      character: 0,
      vehicle: 0,
      airplane: 0,
      animation: 0,
      behavior: 0,
      item: 0,
    };

    allBlueprints.forEach((blueprint) => {
      if (blueprint.type in counts) {
        counts[blueprint.type]++;
      }
    });

    return blueprintCategories
      .map((category) => ({
        ...category,
        count: counts[category.type],
      }))
      .filter((category) => category.count > 0);
  }, [allBlueprints]);

  const filteredBlueprints = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return allBlueprints.filter(blueprint => {
      const matchesCategory = blueprint.type === selectedCategory;
      const matchesSearch = query === '' ||
        blueprint.name.toLowerCase().includes(query) ||
        blueprint.tags.some(tag => tag.toLowerCase().includes(query) || BLUEPRINT_TAG_LABELS.get(tag)?.includes(query));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery, allBlueprints]);

  const handleBlueprintFieldChange = useCallback((path: string[], value: BlueprintFieldValue) => {
    setHasChanges(true);
    setEditingBlueprint((currentBlueprint) => {
      if (!currentBlueprint) return null;
      const nextBlueprint = { ...currentBlueprint } as BlueprintRecord;
      if (!setNestedProperty(nextBlueprint, path, value)) return currentBlueprint;
      return nextBlueprint as AnyBlueprint;
    });
  }, []);

  const handleBlueprintSelect = useCallback((blueprintId: string | null) => {
    setSpawnFailed(false);
    setHasChanges(false);
    setSelectedBlueprint(blueprintId);
    if (blueprintId) {
      const blueprint = blueprintRegistry.get(blueprintId);
      if (blueprint) {
        setEditingBlueprint(JSON.parse(JSON.stringify(blueprint)));
      }
    } else {
      setEditingBlueprint(null);
    }
  }, []);

  useEffect(() => {
    if (hasChanges) return;
    const isSelectedInList = filteredBlueprints.some(b => b.id === selectedBlueprint);
    if (filteredBlueprints[0]?.id && filteredBlueprints.length > 0 && !isSelectedInList) {
      handleBlueprintSelect(filteredBlueprints[0].id);
    } else if (filteredBlueprints.length === 0) {
      handleBlueprintSelect(null);
    }
  }, [filteredBlueprints, selectedBlueprint, handleBlueprintSelect, hasChanges]);

  const handleApplyChanges = () => {
    if (!editingBlueprint) return;
    blueprintRegistry.register(editingBlueprint);
    setAllBlueprints(blueprintRegistry.getAll().map(convertBlueprintToItem));
    setHasChanges(false);
  };

  const handleSpawnEntity = async () => {
    if (!editingBlueprint) return;
    setSpawnFailed(false);
    try {
      handleApplyChanges();
      const spawnedEntity = await spawnAtCursor(editingBlueprint.id);
      if (spawnedEntity) onClose();
      else setSpawnFailed(true);
    } catch (error) {
      logger.error('Blueprint spawn failed', error instanceof Error ? error : String(error));
      setSpawnFailed(true);
    }
  };

  const renderInspectorField = (
    key: string,
    value: BlueprintValue,
    path: string[],
  ): React.ReactNode => {
    const label = BLUEPRINT_FIELD_LABELS[key] ?? key;
    if (Array.isArray(value)) {
      return (
        <details key={path.join('.')} className="blueprint-editor__inspector-group">
          <summary className="blueprint-editor__inspector-title">
            {label} · {value.length === 0 ? '비어 있음' : `${value.length}개 항목`}
          </summary>
          {value.map((item, index) =>
            renderInspectorField(`항목 ${index + 1}`, item, [...path, String(index)]),
          )}
        </details>
      );
    }

    if (isRecord(value)) {
      return (
        <div key={path.join('.')} className="blueprint-editor__inspector-group">
          <div className="blueprint-editor__inspector-title">{label}</div>
          {Object.entries(value).map(([childKey, childValue]) =>
            renderInspectorField(childKey, childValue, [...path, childKey]),
          )}
        </div>
      );
    }

    if (typeof value === 'boolean') {
      return (
        <label key={path.join('.')} className="blueprint-editor__inspector-field">
          <span>{label}</span>
          <button
            className={`blueprint-editor__toggle ${value ? 'blueprint-editor__toggle--on' : ''}`}
            onClick={() => handleBlueprintFieldChange(path, !value)}
            aria-pressed={value}
          >
            {value ? '켜짐' : '꺼짐'}
          </button>
        </label>
      );
    }

    if (typeof value === 'number') {
      return (
        <label key={path.join('.')} className="blueprint-editor__inspector-field">
          <span>{label}</span>
          <input
            type="number"
            value={value}
            onChange={(event) => handleBlueprintFieldChange(path, Number(event.target.value))}
            className="blueprint-editor__inspector-input"
          />
        </label>
      );
    }

    if (path.length === 2 && path[0] === 'camera' && key === 'mode' && typeof value === 'string') {
      return (
        <label key={path.join('.')} className="blueprint-editor__inspector-field">
          <span>카메라 모드</span>
          <select
            value={value}
            onChange={(event) => handleBlueprintFieldChange(path, event.target.value)}
            className="blueprint-editor__inspector-input"
          >
            {!CAMERA_CONTROLLER_DEFAULT_MODES.some((option) => option.value === value) && (
              <option value={value}>사용자 지정 ({value})</option>
            )}
            {CAMERA_CONTROLLER_DEFAULT_MODES.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
      );
    }

    return (
      <label key={path.join('.')} className="blueprint-editor__inspector-field">
        <span>{label}</span>
        <input
          type="text"
          value={typeof value === 'string'
            ? path.length === 1 && key === 'type' ? BLUEPRINT_TYPE_LABELS.get(value) ?? value : value
            : ''}
          readOnly={path.length === 1 && (key === 'id' || key === 'type')}
          onChange={(event) => handleBlueprintFieldChange(path, event.target.value)}
          className="blueprint-editor__inspector-input"
        />
      </label>
    );
  };

  return (
    <div className="blueprint-editor">
      <div className="blueprint-editor__sidebar">
        <div className="blueprint-editor__search">
          <input
            type="text"
            placeholder="블루프린트 검색"
            aria-label="블루프린트 검색"
            disabled={hasChanges}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="blueprint-editor__search-input"
          />
        </div>

        <div className="blueprint-editor__categories">
          {categoriesWithCounts.map((category) => (
            <button
              key={category.id}
              aria-pressed={selectedCategory === category.type}
              disabled={hasChanges}
              onClick={() => setSelectedCategory(category.type)}
              className={`blueprint-editor__category ${selectedCategory === category.type ? 'active' : ''}`}
            >
              <span className="blueprint-editor__category-name">{category.name}</span>
              <span className="blueprint-editor__category-count">{category.count}</span>
            </button>
          ))}
        </div>

        <div className="blueprint-editor__list">
          {filteredBlueprints.map((blueprint) => (
            <button
              key={blueprint.id}
              type="button"
              aria-pressed={selectedBlueprint === blueprint.id}
              disabled={hasChanges}
              onClick={() => handleBlueprintSelect(blueprint.id)}
              className={`blueprint-editor__item ${selectedBlueprint === blueprint.id ? 'active' : ''}`}
            >
              <div className="blueprint-editor__item-name">{blueprint.name}</div>
              <div className="blueprint-editor__item-tags">
                {blueprint.tags.map((tag) => (
                  <span key={tag} className="blueprint-editor__tag">{BLUEPRINT_TAG_LABELS.get(tag) ?? tag}</span>
                ))}
              </div>
            </button>
          ))}
          {filteredBlueprints.length === 0 && (
            <p className="blueprint-editor__empty">조건에 맞는 블루프린트가 없습니다.</p>
          )}
        </div>

        <div className="blueprint-editor__actions">
          {spawnFailed && (
            <p role="alert" className="blueprint-editor__spawn-error">
              생성하지 못했습니다. 월드가 준비되어 있는지 확인한 뒤 다시 시도해 주세요.
            </p>
          )}
          <button
            onClick={handleApplyChanges}
            disabled={!hasChanges || !editingBlueprint || isSpawning}
            className="blueprint-editor__spawn-button"
          >
            변경 적용
          </button>
          {hasChanges && (
            <button
              type="button"
              onClick={() => handleBlueprintSelect(selectedBlueprint)}
              disabled={isSpawning}
              className="blueprint-editor__cancel-button"
            >
              변경 취소
            </button>
          )}
          <p className="blueprint-editor__empty">
            {hasChanges
              ? '다른 항목으로 이동하려면 변경 사항을 적용하거나 취소해 주세요.'
              : '변경 사항은 현재 세션에 적용됩니다. 생성 시에도 함께 적용합니다.'}
          </p>
          <button
            onClick={handleSpawnEntity}
            disabled={!selectedBlueprint || isSpawning}
            className="blueprint-editor__spawn-button"
          >
            {isSpawning ? '생성 중...' : '엔티티 생성'}
          </button>
        </div>
      </div>

      <div className="blueprint-editor__main">
        <div className="blueprint-editor__preview-section">
          <div className="blueprint-editor__preview-header">
            <h3 className="blueprint-editor__preview-title">미리보기</h3>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="blueprint-editor__preview-toggle"
            >
              {showPreview ? '숨기기' : '보기'}
            </button>
          </div>
          {showPreview && (
            <div className="blueprint-editor__preview-container">
              <BlueprintPreview
                key={editingBlueprint ? editingBlueprint.id : 'no-blueprint'}
                blueprint={editingBlueprint}
              />
            </div>
          )}
        </div>

        <div className="blueprint-editor__inspector-section">
          <div className="blueprint-editor__preview-header">
            <h3 className="blueprint-editor__preview-title">속성</h3>
          </div>
          <div className="blueprint-editor__inspector">
            {editingBlueprint ? (
              Object.entries(editingBlueprint as BlueprintRecord).map(([key, value]) =>
                renderInspectorField(key, value, [key]),
              )
            ) : (
              <div className="blueprint-editor__empty">블루프린트를 선택하세요.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 
