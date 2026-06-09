import type { CharacterMenuRenderContext } from '../types';

type CharacterMenuHeaderProps = {
  context: CharacterMenuRenderContext;
};

export function CharacterMenuHeader({ context }: CharacterMenuHeaderProps) {
  return (
    <div
      className={context.classNameFor('header')}
      style={context.styleFor('header', { borderColor: context.preset.theme.borderColor })}
    >
      <h2 className={context.classNameFor('title')}>{context.labels.title}</h2>
      <div className={context.classNameFor('actions')}>
        {context.features.resetButton && (
          <button
            type="button"
            className={context.classNameFor('ghostButton')}
            style={context.styleFor('ghostButton', context.getButtonStyle())}
            onClick={context.actions.reset}
          >
            {context.labels.reset}
          </button>
        )}
        {context.features.closeButton && (
          <button
            type="button"
            className={context.classNameFor('primaryButton')}
            style={context.styleFor('primaryButton', context.getButtonStyle(true))}
            onClick={context.actions.close}
          >
            {context.labels.close}
          </button>
        )}
      </div>
    </div>
  );
}
