import type { ReactNode } from 'react';

import {
  CHARACTER_MENU_DEFAULT_FEATURES,
  CHARACTER_MENU_DEFAULT_SECTIONS,
  CHARACTER_MENU_DEFAULT_SLOTS,
  MENU_PRESETS,
} from './config';
import {
  BasicCustomizerSection,
  CharacterMenuHeader,
  CharacterPreviewSection,
  ColorCustomizerSection,
  OutfitSlotSection,
} from './sections';
import type {
  CharacterMenuClassNameSlot,
  CharacterMenuCloseUpController,
  CharacterMenuFeatures,
  CharacterMenuLabelMaps,
  CharacterMenuLabels,
  CharacterMenuOption,
  CharacterMenuPreset,
  CharacterMenuProps,
  CharacterMenuRenderContext,
  CharacterMenuRenderers,
  CharacterMenuSection,
  CharacterMenuStyles,
  CharacterPreviewMode,
} from './types';
import { useCharacterMenuController } from './useCharacterMenuController';
import './styles.css';

function renderSection(
  context: CharacterMenuRenderContext,
  renderers: CharacterMenuRenderers | undefined,
  section: CharacterMenuSection,
): ReactNode {
  if (section === 'identity') {
    return renderers?.identity?.(context) ?? <BasicCustomizerSection context={context} />;
  }
  if (section === 'colors') {
    return renderers?.colors?.(context) ?? <ColorCustomizerSection context={context} />;
  }
  if (section === 'outfits') {
    return renderers?.outfits?.(context) ?? <OutfitSlotSection context={context} renderers={renderers} />;
  }
  return null;
}
function renderPanelContent(
  context: CharacterMenuRenderContext,
  renderers: CharacterMenuRenderers | undefined,
  children: ReactNode,
): ReactNode {
  return (
    <>
      {renderers?.header?.(context) ?? <CharacterMenuHeader context={context} />}
      <div
        className={context.classNameFor('body')}
        style={context.styleFor('body', { gridTemplateColumns: context.bodyColumns })}
      >
        {context.selectedSections.includes('preview') &&
          (renderers?.preview?.(context) ?? <CharacterPreviewSection context={context} />)}
        {context.rightSections.length > 0 && (
          <div className={context.classNameFor('sectionStack')}>
            {context.rightSections.map((section) => (
              <div key={section}>{renderSection(context, renderers, section)}</div>
            ))}
          </div>
        )}
      </div>
      {children &&
        (renderers?.footer?.(context, children) ?? (
          <div
            className={context.classNameFor('footer')}
            style={context.styleFor('footer', { borderColor: context.preset.theme.borderColor })}
          >
            {children}
          </div>
        ))}
    </>
  );
}
function renderBackdrop(context: CharacterMenuRenderContext): ReactNode {
  return (
    <button
      type="button"
      className={context.classNameFor('backdrop')}
      style={context.styleFor('backdrop', {
        background: context.isCloseUp ? 'transparent' : 'rgba(0, 0, 0, 0.28)',
        backdropFilter: !context.isCloseUp && context.preset.theme.blurEffect ? 'blur(4px)' : 'none',
      })}
      onClick={context.isCloseUp ? undefined : context.actions.close}
      aria-label={context.labels.close}
    />
  );
}
function renderPanel(
  context: CharacterMenuRenderContext,
  renderers: CharacterMenuRenderers | undefined,
  children: ReactNode,
): ReactNode {
  const content = renderPanelContent(context, renderers, children);
  return (
    renderers?.panel?.(context, content) ?? (
      <div
        className={context.classNameFor('panel')}
        style={context.styleFor('panel', context.getPanelStyle())}
        onClick={(event) => event.stopPropagation()}
      >
        {content}
      </div>
    )
  );
}
function renderCloseUpOverlay(context: CharacterMenuRenderContext): ReactNode {
  return (
    <button
      type="button"
      className={context.classNameFor('closeUpOverlay')}
      style={context.styleFor('closeUpOverlay')}
      onClick={context.actions.toggleCloseUp}
      aria-label={context.labels.exitCloseUp}
    />
  );
}
function renderRoot(
  context: CharacterMenuRenderContext,
  renderers: CharacterMenuRenderers | undefined,
  children: ReactNode,
): ReactNode {
  const content = (
    <>
      {renderers?.backdrop?.(context) ?? renderBackdrop(context)}
      {!context.isCloseUp && renderPanel(context, renderers, children)}
      {context.isCloseUp && (renderers?.closeUpOverlay?.(context) ?? renderCloseUpOverlay(context))}
    </>
  );
  return (
    renderers?.root?.(context, content) ?? (
      <div
        className={context.classNameFor('root', context.rootClassName)}
        style={context.styleFor('root', { pointerEvents: context.isCloseUp ? 'none' : 'auto' })}
      >
        {content}
      </div>
    )
  );
}
export function CharacterMenu(props: CharacterMenuProps = {}) {
  const context = useCharacterMenuController(props);
  if (!context.isOpen) return null;
  return <>{renderRoot(context, props.renderers, props.children)}</>;
}
export {
  CHARACTER_MENU_DEFAULT_FEATURES,
  CHARACTER_MENU_DEFAULT_SECTIONS,
  CHARACTER_MENU_DEFAULT_SLOTS,
  MENU_PRESETS,
  useCharacterMenuController,
};
export type {
  CharacterMenuClassNameSlot,
  CharacterMenuCloseUpController,
  CharacterMenuFeatures,
  CharacterMenuLabelMaps,
  CharacterMenuLabels,
  CharacterMenuOption,
  CharacterMenuPreset,
  CharacterMenuProps,
  CharacterMenuRenderContext,
  CharacterMenuRenderers,
  CharacterMenuSection,
  CharacterMenuStyles,
  CharacterPreviewMode,
};
