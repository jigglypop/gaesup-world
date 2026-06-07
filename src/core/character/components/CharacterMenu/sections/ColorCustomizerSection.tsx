import type { AppearanceColors } from '../../../types';
import type { CharacterMenuPreset } from '../types';

type ColorCustomizerSectionProps = {
  appearance: { colors: AppearanceColors };
  onColorChange: (key: keyof AppearanceColors, color: string) => void;
  colorKeys: { key: keyof AppearanceColors; label: string }[];
  preset: CharacterMenuPreset;
};

export function ColorCustomizerSection({
  appearance,
  onColorChange,
  colorKeys,
  preset,
}: ColorCustomizerSectionProps) {
  return (
    <div
      className="p-4 rounded-xl border"
      style={{
        background: 'rgba(0,0,0,0.2)',
        borderColor: preset.theme.borderColor,
      }}
    >
      <p className="text-xs font-bold uppercase opacity-60 mb-3">색상 선택</p>
      <div className="space-y-2">
        {colorKeys.map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between gap-3 p-2 rounded-lg" style={{
            background: 'rgba(255,255,255,0.04)',
          }}>
            <span className="text-sm">{label}</span>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={appearance.colors[key]}
                onChange={(e) => onColorChange(key, e.target.value)}
                className="w-10 h-8 rounded cursor-pointer"
                style={{
                  border: `2px solid ${preset.theme.accentColor}`,
                }}
              />
              <span className="text-xs font-mono opacity-70 w-20">
                {appearance.colors[key]}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
