import React, { useState, useMemo } from 'react';

import './styles.css';
import { BlueprintType, BlueprintCategory, type BlueprintFieldValue } from './types';
import { convertBlueprintToItem } from './utils';
import { blueprintRegistry, AnyBlueprint, CharacterBlueprint, VehicleBlueprint, AirplaneBlueprint } from '../../../';
import { useSpawnFromBlueprint } from '../../../hooks/useSpawnFromBlueprint';
import type { BlueprintRecord, BlueprintValue } from '../../../types';

const isRecord = (value: BlueprintValue | AnyBlueprint | undefined): value is BlueprintRecord =>
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
      if (!Number.isInteger(index) || index < 0 || index >= current.length) {
        return false;
      }
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
    if (!Number.isInteger(index) || index < 0 || index >= current.length) {
      return false;
    }
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

export const BlueprintPanel: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<BlueprintType>('character');
  const [selectedBlueprint, setSelectedBlueprint] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingBlueprint, setEditingBlueprint] = useState<AnyBlueprint | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  
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

    return blueprintCategories.map((category) => ({
      ...category,
      count: counts[category.type],
    }));
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

  const handleBlueprintSelect = (blueprintId: string) => {
    setSelectedBlueprint(blueprintId);
    const blueprint = blueprintRegistry.get(blueprintId);
    if (blueprint) {
      setEditingBlueprint(JSON.parse(JSON.stringify(blueprint)));
    }
  };

  const handleEditBlueprint = () => {
    setIsEditing(true);
  };

  const handleSaveBlueprint = () => {
    if (editingBlueprint) {
      blueprintRegistry.register(editingBlueprint);
      setIsEditing(false);
      setIsCreatingNew(false);
      handleBlueprintSelect(editingBlueprint.id);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (selectedBlueprint) {
      const blueprint = blueprintRegistry.get(selectedBlueprint);
      if (blueprint) {
        setEditingBlueprint(JSON.parse(JSON.stringify(blueprint)));
      }
    }
  };

  const handleCreateNew = () => {
    let newBlueprint: AnyBlueprint;
    
    const baseProps = {
      id: `custom_${selectedCategory}_${Date.now()}`,
      name: `New ${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}`,
      version: '1.0.0',
      tags: ['custom'],
      description: 'Custom blueprint',
    };
    
    switch (selectedCategory) {
      case 'vehicle':
        newBlueprint = {
          ...baseProps,
          type: 'vehicle',
          physics: {
            mass: 1000,
            maxSpeed: 30,
            acceleration: 10,
            braking: 15,
            turning: 2
          },
          seats: [{
            position: [0, 1, 0],
            isDriver: true
          }],
          animations: {
            idle: ''
          }
        } as VehicleBlueprint;
        break;
        
      case 'airplane':
        newBlueprint = {
          ...baseProps,
          type: 'airplane',
          physics: {
            mass: 2000,
            maxSpeed: 100,
            acceleration: 20,
            turning: 1,
            lift: 50,
            drag: 10
          },
          seats: [{
            position: [0, 1, 2],
            isDriver: true
          }],
          animations: {
            idle: ''
          }
        } as AirplaneBlueprint;
        break;
        
      default:
        newBlueprint = {
          ...baseProps,
          type: 'character',
          physics: {
            mass: 70,
            height: 1.8,
            radius: 0.3,
            jumpForce: 300,
            moveSpeed: 5,
            runSpeed: 10,
            airControl: 0.2
          },
          animations: {
            idle: '',
            walk: '',
            run: '',
            jump: {
              start: '',
              loop: '',
              land: ''
            }
          },
          stats: {
            health: 100,
            stamina: 50,
            strength: 10,
            defense: 10,
            speed: 10
          }
        } as CharacterBlueprint;
    }
    
    setEditingBlueprint(newBlueprint);
    setSelectedBlueprint(newBlueprint.id);
    setIsCreatingNew(true);
    setIsEditing(true);
  };

  const handlePropertyChange = (path: string[], value: BlueprintFieldValue) => {
    if (!editingBlueprint) return;
    
    const newBlueprint = JSON.parse(JSON.stringify(editingBlueprint)) as BlueprintRecord;
    if (!setNestedProperty(newBlueprint, path, value)) return;
    setEditingBlueprint(newBlueprint as AnyBlueprint);
  };

  const renderPropertyEditor = (obj: BlueprintRecord, path: string[] = []): React.ReactElement[] => {
    const elements: React.ReactElement[] = [];
    
    Object.entries(obj).forEach(([key, value]) => {
      const currentPath = [...path, key];
      const pathKey = currentPath.join('.');
      
      if (key === 'id' || key === 'type') {
        elements.push(
          <div key={pathKey} className="property-editor__field">
            <label className="property-editor__label editor-text-small">
              {key}:
            </label>
            <input
              type="text"
              value={value as string}
              disabled
              className="property-editor__input property-editor__input--disabled"
            />
          </div>
        );
      } else if (isRecord(value)) {
        elements.push(
          <div key={pathKey} className="property-editor__group">
            <div className="property-editor__group-title editor-text">
              {key.charAt(0).toUpperCase() + key.slice(1)}:
            </div>
            <div className="property-editor__group-content">
              {renderPropertyEditor(value, currentPath)}
            </div>
          </div>
        );
      } else if (Array.isArray(value)) {
        if (value.length > 0 && value.every(isRecord)) {
          elements.push(
            <div key={pathKey} className="property-editor__group">
              <div className="property-editor__group-title editor-text">
                {key.charAt(0).toUpperCase() + key.slice(1)}:
              </div>
              <div className="property-editor__group-content">
                {value.map((item, index) => (
                  <div key={`${pathKey}.${index}`} className="property-editor__array-item">
                    <div className="property-editor__array-item-title editor-text-small">Item {index + 1}</div>
                    {renderPropertyEditor(item, [...currentPath, index.toString()])}
                  </div>
                ))}
              </div>
            </div>
          );
        } else {
          elements.push(
            <div key={pathKey} className="property-editor__field">
              <label className="property-editor__label editor-text-small">
                {key}:
              </label>
              <input
                type="text"
                value={value.join(', ')}
                onChange={(e) => handlePropertyChange(currentPath, e.target.value.split(',').map(s => s.trim()))}
                className="property-editor__input"
              />
            </div>
          );
        }
      } else if (typeof value === 'boolean') {
        elements.push(
          <div key={pathKey} className="property-editor__field">
            <label className="property-editor__checkbox-label editor-text-small">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => handlePropertyChange(currentPath, e.target.checked)}
                className="property-editor__checkbox"
              />
              {key}
            </label>
          </div>
        );
      } else {
        elements.push(
          <div key={pathKey} className="property-editor__field">
            <label className="property-editor__label editor-text-small">
              {key}:
            </label>
            <input
              type={typeof value === 'number' ? 'number' : 'text'}
              value={value as string | number}
              onChange={(e) => handlePropertyChange(currentPath, typeof value === 'number' ? Number(e.target.value) : e.target.value)}
              className="property-editor__input"
            />
          </div>
        );
      }
    });
    
    return elements;
  };

  const handleSpawnEntity = async () => {
    if (!selectedBlueprint) return;
    
    const spawnedEntity = await spawnAtCursor(selectedBlueprint);
    if (!spawnedEntity) return;
  };

  return (
    <div className="blueprint-panel">
      <h3 className="editor-title">Blueprint Library</h3>
      
      <div className="blueprint-panel__toolbar">
        <div className="blueprint-panel__search-container">
        <input
          type="text"
          placeholder="Search blueprints..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="blueprint-panel__search-input"
        />
          <button
            onClick={handleCreateNew}
            className="blueprint-panel__button blueprint-panel__button--primary"
          >
            + New Blueprint
          </button>
        </div>
      </div>

      <div className="blueprint-panel__categories">
        {categoriesWithCounts.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.type)}
            className={`blueprint-panel__category-button ${selectedCategory === category.type ? 'blueprint-panel__category-button--active' : ''}`}
          >
            <span>{category.name}</span>
            <span>({category.count})</span>
          </button>
        ))}
      </div>

      {!isEditing ? (
        <>
        <div className="blueprint-panel__list editor-scrollbar">
          {filteredBlueprints.length === 0 ? (
            <div className="blueprint-panel__empty-message editor-text-small">
              No blueprints found
            </div>
          ) : (
            filteredBlueprints.map((blueprint) => (
              <div
                key={blueprint.id}
                onClick={() => handleBlueprintSelect(blueprint.id)}
                className={`blueprint-panel__list-item ${selectedBlueprint === blueprint.id ? 'blueprint-panel__list-item--selected' : ''}`}
              >
                <div className="list-item__content">
                  <div className="list-item__text-content">
                    <div className="list-item__name editor-text">
                      {blueprint.name}
                    </div>
                    <div className="list-item__description editor-text-small">
                      {blueprint.description}
                    </div>
                    <div className="list-item__tags">
                      {blueprint.tags.map((tag) => (
                        <span
                          key={tag}
                          className="list-item__tag editor-text-small"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="list-item__meta editor-text-small">
                    <div>v{blueprint.version}</div>
                    <div>{blueprint.lastModified}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      {selectedBlueprint && (
        <div className="blueprint-panel__footer">
          <div className="blueprint-panel__footer-buttons">
            <button
              onClick={handleEditBlueprint}
              className="blueprint-panel__button blueprint-panel__button--secondary"
            >
              Edit Blueprint
            </button>
            <button
              onClick={handleSpawnEntity}
              disabled={isSpawning}
              className="blueprint-panel__button blueprint-panel__button--primary"
            >
              {isSpawning ? 'Spawning...' : 'Spawn Entity'}
            </button>
          </div>
            </div>
          )}
        </>
              ) : (
          <>
            <div className="blueprint-panel__property-editor-container editor-scrollbar">
              {editingBlueprint && (
                <div>
                  <h4 className="blueprint-panel__property-editor-title editor-text">
                    {isCreatingNew ? 'Create New Blueprint' : `Edit: ${editingBlueprint.name}`}
                  </h4>
                  {renderPropertyEditor(editingBlueprint as BlueprintRecord)}
                </div>
              )}
            </div>
            
        <div className="blueprint-panel__footer">
          <div className="blueprint-panel__footer-buttons">
            <button
              onClick={handleSaveBlueprint}
              className="blueprint-panel__button blueprint-panel__button--primary"
            >
              {isCreatingNew ? 'Create' : 'Save'}
            </button>
            <button
              onClick={handleCancelEdit}
              className="blueprint-panel__button blueprint-panel__button--danger"
            >
              Cancel
            </button>
          </div>
        </div>
          </>
      )}
    </div>
  );
}; 
