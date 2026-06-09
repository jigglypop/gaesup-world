import React, { useCallback, useMemo, useState, type CSSProperties, type ReactNode } from 'react';

import type {
  AnimationPanelClassNameSlot,
  AnimationPanelLabels,
  AnimationPanelProps,
  AnimationPanelRenderContext,
  AnimationPanelTab,
  AnimationPanelTabConfig,
} from './types';
import { AnimationController } from '../../../animation/components/AnimationController';
import { AnimationDebugPanel } from '../../../animation/components/AnimationDebugPanel';
import { AnimationPlayer } from '../../../animation/components/AnimationPlayer';

export const ANIMATION_PANEL_DEFAULT_LABELS: AnimationPanelLabels = {
  Player: 'Player',
  Controller: 'Controller',
  Debug: 'Debug',
};
export const ANIMATION_PANEL_DEFAULT_TABS: readonly AnimationPanelTabConfig[] = [
  { id: 'Player', label: ANIMATION_PANEL_DEFAULT_LABELS.Player },
  { id: 'Controller', label: ANIMATION_PANEL_DEFAULT_LABELS.Controller },
  { id: 'Debug', label: ANIMATION_PANEL_DEFAULT_LABELS.Debug },
];
export const ANIMATION_PANEL_DEFAULT_CLASSES: Record<AnimationPanelClassNameSlot, string> = {
  root: 'tabbed-panel animation-panel',
  tabs: 'panel-tabs animation-panel-tabs',
  tab: 'panel-tab animation-panel-tab',
  activeTab: 'active animation-panel-tab--active',
  content: 'panel-tab-content animation-panel-content',
  contentWrapper: 'panel-content-wrapper animation-panel-content-wrapper',
};
function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter((value): value is string => Boolean(value)).join(' ');
}
function mergeStyle(
  styles: AnimationPanelProps['styles'],
  slot: AnimationPanelClassNameSlot,
  base?: CSSProperties,
): CSSProperties {
  return { ...base, ...styles?.[slot] };
}
function renderDefaultContent(context: AnimationPanelRenderContext): ReactNode {
  const { componentProps } = context;
  switch (context.activeTab) {
    case 'Player':
      return <AnimationPlayer {...componentProps.player} />;
    case 'Controller':
      return <AnimationController {...componentProps.controller} />;
    case 'Debug':
      return <AnimationDebugPanel {...componentProps.debug} />;
    default:
      return null;
  }
}
export function AnimationPanel({
  activeTab,
  defaultTab = 'Player',
  tabs,
  labels: labelOverrides,
  componentProps = {},
  className,
  style,
  classNames,
  styles,
  renderers,
  onTabChange,
  children,
}: AnimationPanelProps = {}) {
  const [internalActiveTab, setInternalActiveTab] = useState<AnimationPanelTab>(defaultTab);
  const labels = useMemo(
    () => ({ ...ANIMATION_PANEL_DEFAULT_LABELS, ...labelOverrides }),
    [labelOverrides],
  );
  const resolvedTabs = useMemo<readonly AnimationPanelTabConfig[]>(() => {
    return (tabs ?? ANIMATION_PANEL_DEFAULT_TABS).map((tab) => ({
      ...tab,
      label: labelOverrides?.[tab.id] ?? tab.label,
    }));
  }, [labelOverrides, tabs]);
  const availableTab = resolvedTabs.find((tab) => !tab.disabled)?.id ?? defaultTab;
  const requestedActiveTab = activeTab ?? internalActiveTab;
  const resolvedActiveTab = resolvedTabs.some(
    (tab) => tab.id === requestedActiveTab && !tab.disabled,
  )
    ? requestedActiveTab
    : availableTab;
  const handleTabChange = useCallback(
    (tab: AnimationPanelTab) => {
      if (activeTab === undefined) setInternalActiveTab(tab);
      onTabChange?.(tab);
    },
    [activeTab, onTabChange],
  );
  const classNameFor = useCallback(
    (slot: AnimationPanelClassNameSlot, extra?: string) =>
      cx(
        ANIMATION_PANEL_DEFAULT_CLASSES[slot],
        classNames?.[slot],
        slot === 'root' && className,
        extra,
      ),
    [className, classNames],
  );
  const styleFor = useCallback(
    (slot: AnimationPanelClassNameSlot, base?: CSSProperties) => {
      const nextStyle = mergeStyle(styles, slot, base);
      if (slot !== 'root') return nextStyle;
      return { ...nextStyle, ...style };
    },
    [style, styles],
  );
  const context = useMemo<AnimationPanelRenderContext>(
    () => ({
      activeTab: resolvedActiveTab,
      tabs: resolvedTabs,
      labels,
      componentProps,
      classNameFor,
      styleFor,
      actions: { setActiveTab: handleTabChange },
    }),
    [
      classNameFor,
      componentProps,
      handleTabChange,
      labels,
      resolvedActiveTab,
      resolvedTabs,
      styleFor,
    ],
  );
  const renderTab = (tab: AnimationPanelTabConfig): ReactNode => {
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
        onClick={() => context.actions.setActiveTab(tab.id)}
        style={context.styleFor('tab')}
        type="button"
      >
        {tab.label}
      </button>
    );
  };
  const currentTabConfig = resolvedTabs.find((tab) => tab.id === context.activeTab);
  const renderedContent = currentTabConfig?.render?.(context) ?? renderDefaultContent(context);
  const tabsContent = resolvedTabs.map(renderTab);
  const tabsNode = renderers?.tabs ? (
    renderers.tabs(context, tabsContent)
  ) : (
    <div className={context.classNameFor('tabs')} style={context.styleFor('tabs')}>
      {tabsContent}
    </div>
  );
  const defaultContent = (
    <div
      className={context.classNameFor('contentWrapper')}
      style={context.styleFor('contentWrapper')}
    >
      {renderedContent}
    </div>
  );
  const contentChildren = (
    <>
      {defaultContent}
      {children}
    </>
  );
  const contentNode = renderers?.content ? (
    renderers.content(context, contentChildren)
  ) : (
    <div className={context.classNameFor('content')} style={context.styleFor('content')}>
      {contentChildren}
    </div>
  );
  const rootChildren = (
    <>
      {tabsNode}
      {contentNode}
    </>
  );
  if (renderers?.root) return <>{renderers.root(context, rootChildren)}</>;
  return (
    <div className={context.classNameFor('root')} style={context.styleFor('root')}>
      {rootChildren}
    </div>
  );
}
