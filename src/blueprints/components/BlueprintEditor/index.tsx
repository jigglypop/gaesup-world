import React, { useState, useMemo, useCallback, useEffect } from 'react';

import {
  BlueprintType,
  BlueprintCategory,
  BlueprintEditorProps,
} from './types';
import { blueprintRegistry, AnyBlueprint } from '../../';
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
      current = current[index];
      continue;
    }

    if (!isRecord(current)) return false;
    current = current[key];
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
  { id: 'characters', name: 'Characters', type: 'character', count: 0 },
  { id: 'vehicles', name: 'Vehicles', type: 'vehicle', count: 0 },
  { id: 'airplanes', name: 'Airplanes', type: 'airplane', count: 0 },
  { id: 'animations', name: 'Animations', type: 'animation', count: 0 },
  { id: 'behaviors', name: 'Behaviors', type: 'behavior', count: 0 },
  { id: 'items', name: 'Items', type: 'item', count: 0 },
];

export const BlueprintEditor: React.FC<BlueprintEditorProps> = ({ onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<BlueprintType>('character');
  const [selectedBlueprint, setSelectedBlueprint] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingBlueprint, setEditingBlueprint] = useState<AnyBlueprint | null>(null);
  const [showPreview, setShowPreview] = useState(true);

  const { spawnAtCursor, isSpawning } = useSpawnFromBlueprint();

  const allBlueprints = useMemo(() => {
    return blueprintRegistry.getAll().map(convertBlueprintToItem);
  }, []);

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
    return allBlueprints.filter(blueprint => {
      const matchesCategory = blueprint.type === selectedCategory;
      const matchesSearch = searchQuery === '' ||
        blueprint.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blueprint.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery, allBlueprints]);

  const handleBlueprintFieldChange = useCallback((path: string[], value: BlueprintFieldValue) => {
    setEditingBlueprint((currentBlueprint) => {
      if (!currentBlueprint) return null;
      const nextBlueprint = JSON.parse(JSON.stringify(currentBlueprint)) as BlueprintRecord;
      if (!setNestedProperty(nextBlueprint, path, value)) return currentBlueprint;
      return nextBlueprint as AnyBlueprint;
    });
  }, []);

  const handleBlueprintSelect = useCallback((blueprintId: string | null) => {
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
    const isSelectedInList = filteredBlueprints.some(b => b.id === selectedBlueprint);
    if (filteredBlueprints[0]?.id && filteredBlueprints.length > 0 && !isSelectedInList) {
      handleBlueprintSelect(filteredBlueprints[0].id);
    } else if (filteredBlueprints.length === 0) {
      handleBlueprintSelect(null);
    }
  }, [filteredBlueprints, selectedBlueprint, handleBlueprintSelect]);

  const handleSpawnEntity = async () => {
    if (!selectedBlueprint) return;

    const spawnedEntity = await spawnAtCursor(selectedBlueprint);

    if (spawnedEntity) {
      onClose();
    }
  };

  const renderInspectorField = (
    key: string,
    value: BlueprintValue,
    path: string[],
  ): React.ReactNode => {
    if (Array.isArray(value)) {
      return (
        <div key={path.join('.')} className="blueprint-editor__inspector-group">
          <div className="blueprint-editor__inspector-title">{key}</div>
          <div className="blueprint-editor__inspector-list">
            {value.length === 0 ? '비어 있음' : `${value.length}개 항목`}
          </div>
        </div>
      );
    }

    if (isRecord(value)) {
      return (
        <div key={path.join('.')} className="blueprint-editor__inspector-group">
          <div className="blueprint-editor__inspector-title">{key}</div>
          {Object.entries(value).map(([childKey, childValue]) =>
            renderInspectorField(childKey, childValue, [...path, childKey]),
          )}
        </div>
      );
    }

    if (typeof value === 'boolean') {
      return (
        <label key={path.join('.')} className="blueprint-editor__inspector-field">
          <span>{key}</span>
          <button
            className={`blueprint-editor__toggle ${value ? 'blueprint-editor__toggle--on' : ''}`}
            onClick={() => handleBlueprintFieldChange(path, !value)}
          >
            {value ? 'ON' : 'OFF'}
          </button>
        </label>
      );
    }

    if (typeof value === 'number') {
      return (
        <label key={path.join('.')} className="blueprint-editor__inspector-field">
          <span>{key}</span>
          <input
            type="number"
            value={value}
            onChange={(event) => handleBlueprintFieldChange(path, Number(event.target.value))}
            className="blueprint-editor__inspector-input"
          />
        </label>
      );
    }

    return (
      <label key={path.join('.')} className="blueprint-editor__inspector-field">
        <span>{key}</span>
        <input
          type="text"
          value={typeof value === 'string' ? value : ''}
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
            placeholder="Search blueprints..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="blueprint-editor__search-input"
          />
        </div>

        <div className="blueprint-editor__categories">
          {categoriesWithCounts.map((category) => (
            <button
              key={category.id}
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
            <div
              key={blueprint.id}
              onClick={() => handleBlueprintSelect(blueprint.id)}
              className={`blueprint-editor__item ${selectedBlueprint === blueprint.id ? 'active' : ''}`}
            >
              <div className="blueprint-editor__item-name">{blueprint.name}</div>
              <div className="blueprint-editor__item-tags">
                {blueprint.tags.map((tag) => (
                  <span key={tag} className="blueprint-editor__tag">{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="blueprint-editor__actions">
          <button
            onClick={handleSpawnEntity}
            disabled={!selectedBlueprint || isSpawning}
            className="blueprint-editor__spawn-button"
          >
            {isSpawning ? 'Spawning...' : 'Spawn Entity'}
          </button>
        </div>
      </div>

      <div className="blueprint-editor__main">
        <div className="blueprint-editor__preview-section">
          <div className="blueprint-editor__preview-header">
            <h3 className="blueprint-editor__preview-title">Preview</h3>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="blueprint-editor__preview-toggle"
            >
              {showPreview ? 'Hide' : 'Show'}
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
            <h3 className="blueprint-editor__preview-title">Inspector</h3>
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
