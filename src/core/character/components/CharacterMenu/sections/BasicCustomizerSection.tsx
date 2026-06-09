import type { CharacterMenuRenderContext } from '../types';

type BasicCustomizerSectionProps = {
  context: CharacterMenuRenderContext;
};

export function BasicCustomizerSection({ context }: BasicCustomizerSectionProps) {
  return (
    <section
      className={context.classNameFor('section')}
      style={context.styleFor('section', context.getSectionStyle())}
    >
      {context.features.nameEditor && (
        <label className={context.classNameFor('sectionStack')}>
          <span className={context.classNameFor('sectionTitle')}>{context.labels.name}</span>
          <input
            value={context.appearance.name}
            onChange={(event) => context.actions.setName(event.target.value)}
            maxLength={16}
            className={context.classNameFor('input')}
            style={context.styleFor('input', {
              borderColor: context.preset.theme.borderColor,
              color: context.preset.theme.textColor,
            })}
          />
        </label>
      )}
      {context.features.hairPicker && (
        <div className={context.classNameFor('sectionStack')}>
          <p className={context.classNameFor('sectionTitle')}>{context.labels.hair}</p>
          <div className={context.classNameFor('optionRow')}>
            {context.hairOptions.map((option) => {
              const active = context.appearance.hair === option.value;
              return (
                <button
                  type="button"
                  key={option.value}
                  className={context.classNameFor(active ? 'activeChip' : 'chip')}
                  style={context.styleFor(active ? 'activeChip' : 'chip', context.getButtonStyle(active))}
                  onClick={() => context.actions.setHair(option.value)}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
      {context.features.facePicker && (
        <div className={context.classNameFor('sectionStack')}>
          <p className={context.classNameFor('sectionTitle')}>{context.labels.face}</p>
          <div className={context.classNameFor('optionRow')}>
            {context.faceOptions.map((option) => {
              const active = context.appearance.face === option.value;
              return (
                <button
                  type="button"
                  key={option.value}
                  className={context.classNameFor(active ? 'activeChip' : 'chip')}
                  style={context.styleFor(active ? 'activeChip' : 'chip', context.getButtonStyle(active))}
                  onClick={() => context.actions.setFace(option.value)}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
