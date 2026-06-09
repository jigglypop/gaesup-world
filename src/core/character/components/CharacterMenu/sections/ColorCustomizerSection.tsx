import type { CharacterMenuRenderContext } from '../types';

type ColorCustomizerSectionProps = {
  context: CharacterMenuRenderContext;
};

export function ColorCustomizerSection({ context }: ColorCustomizerSectionProps) {
  return (
    <section
      className={context.classNameFor('section')}
      style={context.styleFor('section', context.getSectionStyle())}
    >
      <p className={context.classNameFor('sectionTitle')}>{context.labels.colors}</p>
      <div className={context.classNameFor('colorGrid')}>
        {context.colorOptions.map((option) => (
          <label key={option.value} className={context.classNameFor('colorRow')}>
            <span className={context.classNameFor('colorLabel')}>{option.label}</span>
            <input
              type="color"
              value={context.appearance.colors[option.value]}
              onChange={(event) => context.actions.setColor(option.value, event.target.value)}
              className={context.classNameFor('colorInput')}
              style={context.styleFor('colorInput', { borderColor: context.preset.theme.accentColor })}
            />
          </label>
        ))}
      </div>
    </section>
  );
}
