import React, { useCallback, useMemo, useState, type CSSProperties, type ReactNode } from 'react';

import { CameraSettingsTab } from './CameraSettingsTab';
import type {
  CameraPanelClassNameSlot,
  CameraPanelLabels,
  CameraPanelProps,
  CameraPanelRenderContext,
  CameraPanelTab,
  CameraPanelTabConfig,
} from './types';
import { CameraController } from '../../../camera/components/CameraController';
import { CameraDebugPanel } from '../../../camera/components/CameraDebugPanel';
import { CameraPresets } from '../../../camera/components/CameraPresets';

const CAMERA_PANEL_DEFAULT_LABELS: CameraPanelLabels = {
  Settings: 'Settings',
  Controller: 'Controller',
  Presets: 'Presets',
  Debug: 'Debug',
};
const CAMERA_PANEL_DEFAULT_TABS: readonly CameraPanelTabConfig[] = [
  { id: 'Settings', label: CAMERA_PANEL_DEFAULT_LABELS.Settings },
  { id: 'Controller', label: CAMERA_PANEL_DEFAULT_LABELS.Controller },
  { id: 'Presets', label: CAMERA_PANEL_DEFAULT_LABELS.Presets },
  { id: 'Debug', label: CAMERA_PANEL_DEFAULT_LABELS.Debug },
];
const CAMERA_PANEL_DEFAULT_CLASSES: Record<CameraPanelClassNameSlot, string> = {
  root: 'tabbed-panel camera-panel',
  tabs: 'panel-tabs camera-panel-tabs',
  tab: 'panel-tab camera-panel-tab',
  activeTab: 'active camera-panel-tab--active',
  content: 'panel-tab-content camera-panel-content',
};
function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter((value): value is string => Boolean(value)).join(' ');
}
function mergeStyle(
  styles: CameraPanelProps['styles'],
  slot: CameraPanelClassNameSlot,
  base?: CSSProperties,
): CSSProperties {
  return { ...base, ...styles?.[slot] };
}
function renderDefaultContent(
  tab: CameraPanelTab,
  componentProps: CameraPanelRenderContext['componentProps'],
): ReactNode {
  switch (tab) {
    case 'Settings':
      return <CameraSettingsTab {...componentProps.settings} />;
    case 'Controller':
      return <CameraController {...componentProps.controller} />;
    case 'Presets':
      return <CameraPresets {...componentProps.presets} />;
    case 'Debug':
      return <CameraDebugPanel {...componentProps.debug} />;
    default:
      return null;
  }
}
export function CameraPanel({
  activeTab,
  defaultTab = 'Settings',
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
}: CameraPanelProps = {}) {
  const [internalActiveTab, setInternalActiveTab] = useState<CameraPanelTab>(defaultTab);
  const labels = useMemo(
    () => ({ ...CAMERA_PANEL_DEFAULT_LABELS, ...labelOverrides }),
    [labelOverrides],
  );
  const resolvedTabs = useMemo<readonly CameraPanelTabConfig[]>(() => {
    return (tabs ?? CAMERA_PANEL_DEFAULT_TABS).map((tab) => ({
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
    (tab: CameraPanelTab) => {
      if (activeTab === undefined) setInternalActiveTab(tab);
      onTabChange?.(tab);
    },
    [activeTab, onTabChange],
  );
  const classNameFor = useCallback(
    (slot: CameraPanelClassNameSlot, extra?: string) =>
      cx(
        CAMERA_PANEL_DEFAULT_CLASSES[slot],
        classNames?.[slot],
        slot === 'root' && className,
        extra,
      ),
    [className, classNames],
  );
  const styleFor = useCallback(
    (slot: CameraPanelClassNameSlot, base?: CSSProperties) => {
      const nextStyle = mergeStyle(styles, slot, base);
      if (slot !== 'root') return nextStyle;
      return { ...nextStyle, ...style };
    },
    [style, styles],
  );
  const context = useMemo<CameraPanelRenderContext>(
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
  const renderTab = (tab: CameraPanelTabConfig): ReactNode => {
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
  const renderedContent =
    currentTabConfig?.render?.(context) ?? renderDefaultContent(context.activeTab, componentProps);
  const tabsContent = resolvedTabs.map(renderTab);
  const tabsNode = renderers?.tabs ? (
    renderers.tabs(context, tabsContent)
  ) : (
    <div className={context.classNameFor('tabs')} style={context.styleFor('tabs')}>
      {tabsContent}
    </div>
  );
  const contentNode = renderers?.content ? (
    renderers.content(
      context,
      <>
        {renderedContent}
        {children}
      </>,
    )
  ) : (
    <div className={context.classNameFor('content')} style={context.styleFor('content')}>
      {renderedContent}
      {children}
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
export { CAMERA_PANEL_DEFAULT_CLASSES, CAMERA_PANEL_DEFAULT_LABELS, CAMERA_PANEL_DEFAULT_TABS };
