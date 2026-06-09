import { CHARACTER_MENU_ROTATION_STEP } from '../config';
import type { CharacterMenuRenderContext } from '../types';

type CharacterPreviewSectionProps = {
  context: CharacterMenuRenderContext;
};

export function CharacterPreviewSection({ context }: CharacterPreviewSectionProps) {
  return (
    <section className={context.classNameFor('previewSection')}>
      <p className={context.classNameFor('sectionTitle')}>{context.labels.preview}</p>
      <div
        className={context.classNameFor('previewFrame')}
        style={context.styleFor('previewFrame', { borderColor: context.preset.theme.borderColor })}
      >
        <div
          className={context.classNameFor('previewGlyph')}
          style={context.styleFor('previewGlyph', context.getPreviewGlyphStyle())}
        />
      </div>
      {(context.features.zoomControl || context.features.previewRotate || context.features.closeUpMode) && (
        <div className={context.classNameFor('previewControls')}>
          {context.features.zoomControl && (
            <label className={context.classNameFor('previewControlGroup')}>
              <span style={{ color: context.preset.theme.mutedTextColor }}>{context.labels.zoom}</span>
              <input
                type="range"
                min="0.6"
                max="2.4"
                step="0.1"
                value={context.zoom}
                onChange={(event) => context.actions.setZoom(Number(event.target.value))}
                className={context.classNameFor('range')}
                aria-label={context.labels.zoom}
              />
            </label>
          )}
          {context.features.previewRotate && (
            <div className={context.classNameFor('previewControlGroup')}>
              <button
                type="button"
                className={context.classNameFor('iconButton')}
                style={context.styleFor('iconButton', context.getButtonStyle())}
                onClick={() => context.actions.rotatePreview(-CHARACTER_MENU_ROTATION_STEP)}
                aria-label={context.labels.rotateLeft}
              >
                -{CHARACTER_MENU_ROTATION_STEP}
              </button>
              <button
                type="button"
                className={context.classNameFor('iconButton')}
                style={context.styleFor('iconButton', context.getButtonStyle())}
                onClick={() => context.actions.rotatePreview(CHARACTER_MENU_ROTATION_STEP)}
                aria-label={context.labels.rotateRight}
              >
                +{CHARACTER_MENU_ROTATION_STEP}
              </button>
            </div>
          )}
          {context.features.closeUpMode && (
            <button
              type="button"
              className={context.classNameFor('ghostButton')}
              style={context.styleFor('ghostButton', context.getButtonStyle(context.isCloseUp))}
              onClick={context.actions.toggleCloseUp}
            >
              {context.labels.closeUp}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
