import React, { useMemo, useState } from 'react';

import type { EditorPanelBaseProps } from './types';
import type { SceneDocument, SceneObject, SceneObjectId } from '../../../scene-object';

export type HierarchyPanelProps = EditorPanelBaseProps & {
  sceneDocument?: SceneDocument;
  selectedObjectId?: SceneObjectId;
  selectedObjectIds?: SceneObjectId[];
  hoveredObjectId?: SceneObjectId;
  defaultExpandedIds?: SceneObjectId[];
  searchPlaceholder?: string;
  emptyLabel?: string;
  onSelectObject?: (object: SceneObject) => void;
  onHoverObject?: (object: SceneObject | undefined) => void;
};

type HierarchyRow = {
  object: SceneObject;
  depth: number;
  hasChildren: boolean;
};

const ROOT_KEY = '__root__';

export function HierarchyPanel({
  sceneDocument,
  selectedObjectId,
  selectedObjectIds = selectedObjectId ? [selectedObjectId] : [],
  hoveredObjectId,
  defaultExpandedIds = [],
  searchPlaceholder = 'Search objects',
  emptyLabel = 'No scene objects',
  onSelectObject,
  onHoverObject,
  className = '',
  style,
  children,
}: HierarchyPanelProps = {}) {
  const [query, setQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<SceneObjectId>>(() => new Set(defaultExpandedIds));
  const rows = useMemo(
    () => buildHierarchyRows(sceneDocument?.objects ?? [], expandedIds, query),
    [expandedIds, query, sceneDocument],
  );
  const totalObjects = sceneDocument?.objects.length ?? 0;

  const toggleExpanded = (objectId: SceneObjectId) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(objectId)) next.delete(objectId);
      else next.add(objectId);
      return next;
    });
  };

  return (
    <div className={`hierarchy-panel hierarchy-panel--scene-object ${className}`} style={style}>
      <div className="hierarchy-panel__toolbar">
        <input
          className="hierarchy-panel__search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={searchPlaceholder}
          aria-label="Search scene hierarchy"
        />
        <span className="hierarchy-panel__count">{totalObjects}</span>
      </div>

      <div className="hierarchy-panel__tree" role="tree" aria-label="Scene hierarchy">
        {rows.length === 0 ? (
          <div className="hierarchy-panel__empty">{emptyLabel}</div>
        ) : rows.map(({ object, depth, hasChildren }) => {
          const isExpanded = query.trim() ? true : expandedIds.has(object.id);
          const isSelected = selectedObjectIds.includes(object.id);
          const isHovered = object.id === hoveredObjectId;
          return (
            <div
              key={object.id}
              className={`hierarchy-item ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''}`}
              role="treeitem"
              aria-selected={isSelected}
              aria-expanded={hasChildren ? isExpanded : undefined}
              style={{ paddingLeft: `${12 + depth * 14}px` }}
              onMouseEnter={() => onHoverObject?.(object)}
              onMouseLeave={() => onHoverObject?.(undefined)}
            >
              <button
                type="button"
                className="hierarchy-toggle"
                onClick={() => toggleExpanded(object.id)}
                disabled={!hasChildren || Boolean(query.trim())}
                aria-label={isExpanded ? 'Collapse object' : 'Expand object'}
              >
                {hasChildren ? (isExpanded ? '-' : '+') : ''}
              </button>
              <button
                type="button"
                className="hierarchy-object"
                onClick={() => onSelectObject?.(object)}
              >
                <span className="hierarchy-name">{object.name || object.id}</span>
                <span className="hierarchy-meta">
                  {object.layer ? <span>{object.layer}</span> : null}
                  {object.components.length > 0 ? <span>{object.components.length}c</span> : null}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {children}
    </div>
  );
}

export function buildHierarchyRows(
  objects: SceneObject[],
  expandedIds: ReadonlySet<SceneObjectId> = new Set(),
  query = '',
): HierarchyRow[] {
  const normalizedQuery = query.trim().toLowerCase();
  const objectIds = new Set(objects.map((object) => object.id));
  const childrenByParent = new Map<SceneObjectId | typeof ROOT_KEY, SceneObject[]>();
  const objectById = new Map(objects.map((object) => [object.id, object]));

  objects.forEach((object) => {
    const parentKey = object.parentId && objectIds.has(object.parentId) ? object.parentId : ROOT_KEY;
    const bucket = childrenByParent.get(parentKey) ?? [];
    bucket.push(object);
    childrenByParent.set(parentKey, bucket);
  });

  const visibleIds = normalizedQuery ? collectMatchingIds(objects, objectById, normalizedQuery) : undefined;
  const rows: HierarchyRow[] = [];
  const visit = (object: SceneObject, depth: number) => {
    if (visibleIds && !visibleIds.has(object.id)) return;

    const children = childrenByParent.get(object.id) ?? [];
    rows.push({ object, depth, hasChildren: children.length > 0 });

    if (normalizedQuery || expandedIds.has(object.id)) {
      children.forEach((child) => visit(child, depth + 1));
    }
  };

  (childrenByParent.get(ROOT_KEY) ?? []).forEach((object) => visit(object, 0));
  return rows;
}

function collectMatchingIds(
  objects: SceneObject[],
  objectById: ReadonlyMap<SceneObjectId, SceneObject>,
  query: string,
): Set<SceneObjectId> {
  const visibleIds = new Set<SceneObjectId>();
  objects.forEach((object) => {
    if (!matchesObject(object, query)) return;

    let current: SceneObject | undefined = object;
    while (current) {
      visibleIds.add(current.id);
      current = current.parentId ? objectById.get(current.parentId) : undefined;
    }
  });
  return visibleIds;
}

function matchesObject(object: SceneObject, query: string): boolean {
  return (
    object.id.toLowerCase().includes(query) ||
    object.name.toLowerCase().includes(query) ||
    object.tags.some((tag) => tag.toLowerCase().includes(query)) ||
    Boolean(object.layer?.toLowerCase().includes(query))
  );
}
