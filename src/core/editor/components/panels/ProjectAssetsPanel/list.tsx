import React, { type ReactNode } from 'react';

import type {
  ProjectAssetItem,
  ProjectAssetsPanelRenderContext,
  ProjectAssetsPanelRenderers,
} from './types';

function renderItemThumb(
  context: ProjectAssetsPanelRenderContext,
  item: ProjectAssetItem,
): ReactNode {
  return (
    <span className={context.classNameFor('thumb')} style={context.styleFor('thumb')}>
      {item.thumbnailUrl ? (
        <img alt="" src={item.thumbnailUrl} />
      ) : (
        item.kind.slice(0, 2).toUpperCase()
      )}
    </span>
  );
}
function renderItem(
  context: ProjectAssetsPanelRenderContext,
  renderers: ProjectAssetsPanelRenderers | undefined,
  item: ProjectAssetItem,
): ReactNode {
  const active = context.activeId === item.id;
  if (renderers?.item) return renderers.item(context, item, active);
  return (
    <button
      className={context.classNameFor(
        'item',
        active ? context.classNameFor('activeItem') : undefined,
      )}
      key={`${item.group}:${item.id}`}
      onClick={() => context.actions.selectItem(item)}
      role="listitem"
      style={context.styleFor('item')}
      type="button"
    >
      {renderItemThumb(context, item)}
      <span className={context.classNameFor('itemMain')} style={context.styleFor('itemMain')}>
        <strong className={context.classNameFor('itemName')} style={context.styleFor('itemName')}>
          {item.name}
        </strong>
        <span
          className={context.classNameFor('itemSubtitle')}
          style={context.styleFor('itemSubtitle')}
        >
          {item.subtitle ?? item.kind}
        </span>
      </span>
      <span className={context.classNameFor('badges')} style={context.styleFor('badges')}>
        <span className={context.classNameFor('badge')} style={context.styleFor('badge')}>
          {item.kind}
        </span>
        {item.tags.slice(0, 2).map((tag) => (
          <span
            className={context.classNameFor('badge')}
            key={tag}
            style={context.styleFor('badge')}
          >
            {tag}
          </span>
        ))}
      </span>
    </button>
  );
}
export function renderProjectAssetsPanelList(
  context: ProjectAssetsPanelRenderContext,
  renderers?: ProjectAssetsPanelRenderers,
): ReactNode {
  const children =
    context.items.length === 0
      ? (renderers?.empty?.(context) ?? (
          <div className={context.classNameFor('empty')} style={context.styleFor('empty')}>
            {context.labels.empty}
          </div>
        ))
      : context.items.map((item) => renderItem(context, renderers, item));
  if (renderers?.list) return renderers.list(context, children);
  return (
    <div className={context.classNameFor('list')} role="list" style={context.styleFor('list')}>
      {children}
    </div>
  );
}
