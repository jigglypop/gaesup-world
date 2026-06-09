import React, { type ReactNode } from 'react';

import { renderProjectAssetsPanelList } from './list';
import type {
  ProjectAssetPanelTabConfig,
  ProjectAssetsPanelRenderContext,
  ProjectAssetsPanelRenderers,
} from './types';

function renderTab(
  context: ProjectAssetsPanelRenderContext,
  renderers: ProjectAssetsPanelRenderers | undefined,
  tab: ProjectAssetPanelTabConfig,
): ReactNode {
  const active = tab.id === context.activeTab;
  if (renderers?.tab) return renderers.tab(context, tab, active);
  return (
    <button
      className={context.classNameFor(
        'tab',
        active ? context.classNameFor('activeTab') : undefined,
      )}
      disabled={tab.disabled}
      key={tab.id}
      onClick={() => context.actions.setTab(tab.id)}
      style={context.styleFor('tab')}
      type="button"
    >
      {tab.label}
    </button>
  );
}
function renderTabs(
  context: ProjectAssetsPanelRenderContext,
  renderers?: ProjectAssetsPanelRenderers,
): ReactNode {
  const children = context.tabs.map((tab) => renderTab(context, renderers, tab));
  if (renderers?.tabs) return renderers.tabs(context, children);
  return (
    <div
      aria-label={context.labels.tabsAriaLabel}
      className={context.classNameFor('tabs')}
      role="tablist"
      style={context.styleFor('tabs')}
    >
      {children}
    </div>
  );
}
function renderSearch(
  context: ProjectAssetsPanelRenderContext,
  renderers?: ProjectAssetsPanelRenderers,
): ReactNode {
  if (renderers?.search) return renderers.search(context);
  return (
    <input
      aria-label={context.labels.searchAriaLabel}
      className={context.classNameFor('searchInput')}
      onChange={(event) => context.actions.setQuery(event.target.value)}
      placeholder={context.labels.searchPlaceholder}
      style={context.styleFor('searchInput')}
      type="search"
      value={context.query}
    />
  );
}
function renderKindFilter(
  context: ProjectAssetsPanelRenderContext,
  renderers?: ProjectAssetsPanelRenderers,
): ReactNode {
  if (renderers?.kindFilter) return renderers.kindFilter(context);
  return (
    <select
      aria-label={context.labels.kindFilterAriaLabel}
      className={context.classNameFor('kindSelect')}
      disabled={context.activeTab !== 'assets'}
      onChange={(event) =>
        context.actions.setKind(event.target.value as ProjectAssetsPanelRenderContext['kind'])
      }
      style={context.styleFor('kindSelect')}
      value={context.kind}
    >
      {context.kindOptions.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}
function renderToolbar(
  context: ProjectAssetsPanelRenderContext,
  renderers?: ProjectAssetsPanelRenderers,
): ReactNode {
  const children = (
    <>
      {renderTabs(context, renderers)}
      {renderSearch(context, renderers)}
      {renderKindFilter(context, renderers)}
    </>
  );
  if (renderers?.toolbar) return renderers.toolbar(context, children);
  return (
    <div className={context.classNameFor('toolbar')} style={context.styleFor('toolbar')}>
      {children}
    </div>
  );
}
function renderStatus(
  context: ProjectAssetsPanelRenderContext,
  renderers?: ProjectAssetsPanelRenderers,
): ReactNode {
  if (renderers?.status) return renderers.status(context);
  return (
    <div className={context.classNameFor('status')} style={context.styleFor('status')}>
      <span className={context.classNameFor('statusCount')} style={context.styleFor('statusCount')}>
        {context.labels.statusItems(context.items.length)}
      </span>
      <span
        className={context.classNameFor('statusCatalog')}
        style={context.styleFor('statusCatalog')}
      >
        {context.catalogStatus?.state ?? context.labels.statusFallback}
      </span>
    </div>
  );
}
export function renderProjectAssetsPanelContent(
  context: ProjectAssetsPanelRenderContext,
  renderers: ProjectAssetsPanelRenderers | undefined,
  children: ReactNode,
): ReactNode {
  return (
    <>
      {renderToolbar(context, renderers)}
      {renderStatus(context, renderers)}
      {renderProjectAssetsPanelList(context, renderers)}
      {children}
    </>
  );
}
