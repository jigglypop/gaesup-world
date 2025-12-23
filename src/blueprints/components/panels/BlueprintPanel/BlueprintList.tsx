import React from 'react';

import { BlueprintCard } from '../../BlueprintCard';
import { BlueprintItem } from '../types';

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
        <BlueprintCard
          key={blueprint.id}
          blueprint={blueprint}
          isSelected={selectedId === blueprint.id}
          onClick={() => onSelect(blueprint.id)}
          onSpawn={onSpawn ? () => onSpawn(blueprint.id) : undefined}
          isSpawning={isSpawning}
        />
      ))}
      {blueprints.length === 0 && (
        <div className="blueprint-list__empty">
          No blueprints found
        </div>
      )}
    </div>
  );
}; 