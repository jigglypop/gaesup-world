import React, { useCallback, useMemo, useState, type CSSProperties, type ReactNode } from 'react';

import type {
  MotionPanelClassNameSlot,
  MotionPanelLabels,
  MotionPanelProps,
  MotionPanelRenderContext,
  MotionPanelTab,
  MotionPanelTabConfig,
} from './types';
import { MotionController } from '../../../motions/controller/MotionController';
import { MotionDebugPanel } from '../../../motions/ui/MotionDebugPanel';

export const MOTION_PANEL_DEFAULT_LABELS: MotionPanelLabels = {
  Controller: 'Controller',
  Debug: 'Debug',
};
export const MOTION_PANEL_DEFAULT_TABS: readonly MotionPanelTabConfig[] = [
  { id: 'Controller', label: MOTION_PANEL_DEFAULT_LABELS.Controller },
  { id: 'Debug', label: MOTION_PANEL_DEFAULT_LABELS.Debug },
];
export const MOTION_PANEL_DEFAULT_CLASSES: Record<MotionPanelClassNameSlot, string> = {
  root: 'tabbed-panel motion-panel',
  tabs: 'panel-tabs motion-panel-tabs',
  tab: 'panel-tab motion-panel-tab',
  activeTab: 'active motion-panel-tab--active',
  content: 'panel-tab-content motion-panel-content',
  contentWrapper: 'panel-content-wrapper motion-panel-content-wrapper',
};
function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter((value): value is string => Boolean(value)).join(' ');
}
function mergeStyle(
  styles: MotionPanelProps['styles'],
  slot: MotionPanelClassNameSlot,
  base?: CSSProperties,
): CSSProperties {
  return { ...base, ...styles?.[slot] };
}
function renderDefaultContent(context: MotionPanelRenderContext): ReactNode {
  const { componentProps } = context;
  switch (context.activeTab) {
    case 'Controller':
      return <MotionController {...componentProps.controller} />;
    case 'Debug':
      return <MotionDebugPanel embedded {...componentProps.debug} />;
    default:
      return null;
  }
}
export function MotionPanel({
  activeTab,
  defaultTab = 'Controller',
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
}: MotionPanelProps = {}) {
  const [internalActiveTab, setInternalActiveTab] = useState<MotionPanelTab>(defaultTab);
  const labels = useMemo(
    () => ({ ...MOTION_PANEL_DEFAULT_LABELS, ...labelOverrides }),
    [labelOverrides],
  );
  const resolvedTabs = useMemo<readonly MotionPanelTabConfig[]>(() => {
    return (tabs ?? MOTION_PANEL_DEFAULT_TABS).map((tab) => ({
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
    (tab: MotionPanelTab) => {
      if (activeTab === undefined) setInternalActiveTab(tab);
      onTabChange?.(tab);
    },
    [activeTab, onTabChange],
  );
  const classNameFor = useCallback(
    (slot: MotionPanelClassNameSlot, extra?: string) =>
      cx(
        MOTION_PANEL_DEFAULT_CLASSES[slot],
        classNames?.[slot],
        slot === 'root' && className,
        extra,
      ),
    [className, classNames],
  );
  const styleFor = useCallback(
    (slot: MotionPanelClassNameSlot, base?: CSSProperties) => {
      const nextStyle = mergeStyle(styles, slot, base);
      if (slot !== 'root') return nextStyle;
      return { ...nextStyle, ...style };
    },
    [style, styles],
  );
  const context = useMemo<MotionPanelRenderContext>(
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
  const renderTab = (tab: MotionPanelTabConfig): ReactNode => {
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
