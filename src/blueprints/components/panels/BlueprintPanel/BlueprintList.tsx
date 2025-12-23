import React from 'react';

import { BlueprintItem } from './types';

export type BlueprintListProps = {
  blueprints: BlueprintItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onSpawn?: (id: string) => void;
  isSpawning?: boolean;
};

export const BlueprintList: React.FC<BlueprintListProps> = ({
  blueprints,
  selectedId,
  onSelect,
  onSpawn,
  isSpawning = false,
}) => {
  return (
    <div className="blueprint-list">
      {blueprints.map((blueprint) => (
        <div
          key={blueprint.id}
          className={`blueprint-list__item ${selectedId === blueprint.id ? 'blueprint-list__item--selected' : ''}`}
        >
          <button
            type="button"
            className="blueprint-list__select"
            onClick={() => onSelect(blueprint.id)}
          >
            <div className="blueprint-list__name">{blueprint.name}</div>
            <div className="blueprint-list__meta">
              <span className="blueprint-list__type">{blueprint.type}</span>
              <span className="blueprint-list__version">{blueprint.version}</span>
            </div>
          </button>
          {onSpawn && (
            <button
              type="button"
              className="blueprint-list__spawn"
              disabled={isSpawning}
              onClick={() => onSpawn(blueprint.id)}
            >
              Spawn
            </button>
          )}
        </div>
      ))}
      {blueprints.length === 0 && (
        <div className="blueprint-list__empty">
          No blueprints found
        </div>
      )}
    </div>
  );
}; 