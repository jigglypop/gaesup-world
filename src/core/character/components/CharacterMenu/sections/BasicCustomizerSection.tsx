import type { FaceStyle, HairStyle } from '../../../types';
import { FACE_STYLE_LABEL, HAIR_STYLE_LABEL } from '../../../types';
import type { CharacterMenuPreset } from '../types';

type BasicCustomizerSectionProps = {
  appearance: { name: string; hair: HairStyle; face: FaceStyle };
  onNameChange: (name: string) => void;
  hairOptions: HairStyle[];
  faceOptions: FaceStyle[];
  onHairChange: (hair: HairStyle) => void;
  onFaceChange: (face: FaceStyle) => void;
  preset: CharacterMenuPreset;
  compact?: boolean;
};

export function BasicCustomizerSection({
  appearance,
  onNameChange,
  hairOptions,
  faceOptions,
  onHairChange,
  onFaceChange,
  preset,
  compact,
}: BasicCustomizerSectionProps) {
  return (
    <div className="space-y-3">
      <div
        className="p-3 rounded-lg border"
        style={{
          background: 'rgba(0,0,0,0.2)',
          borderColor: preset.theme.borderColor,
        }}
      >
        <p className="text-xs font-bold uppercase opacity-60 mb-2">이름</p>
        <input
          value={appearance.name}
          onChange={(e) => onNameChange(e.target.value)}
          maxLength={16}
          className="w-full px-3 py-2 rounded-lg border text-sm"
          placeholder="캐릭터 이름..."
          style={{
            background: 'rgba(255,255,255,0.08)',
            borderColor: preset.theme.borderColor,
            color: preset.theme.textColor,
          }}
        />
      </div>

      <div
        className="p-3 rounded-lg border"
        style={{
          background: 'rgba(0,0,0,0.2)',
          borderColor: preset.theme.borderColor,
        }}
      >
        <p className="text-xs font-bold uppercase opacity-60 mb-2">헤어</p>
        <div className="flex flex-wrap gap-2">
          {hairOptions.map((h) => (
            <button
              key={h}
              onClick={() => onHairChange(h)}
              className="px-3 py-1 rounded-full border text-xs font-semibold transition-all"
              style={{
                background:
                  appearance.hair === h
                    ? preset.theme.accentColor + '30'
                    : 'rgba(255,255,255,0.08)',
                borderColor:
                  appearance.hair === h
                    ? preset.theme.accentColor
                    : preset.theme.borderColor,
                color:
                  appearance.hair === h
                    ? preset.theme.accentColor
                    : preset.theme.textColor,
              }}
            >
              {HAIR_STYLE_LABEL[h]}
            </button>
          ))}
        </div>
      </div>

      <div
        className="p-3 rounded-lg border"
        style={{
          background: 'rgba(0,0,0,0.2)',
          borderColor: preset.theme.borderColor,
        }}
      >
        <p className="text-xs font-bold uppercase opacity-60 mb-2">표정</p>
        <div className="flex flex-wrap gap-2">
          {faceOptions.map((f) => (
            <button
              key={f}
              onClick={() => onFaceChange(f)}
              className="px-3 py-1 rounded-full border text-xs font-semibold transition-all"
              style={{
                background:
                  appearance.face === f
                    ? preset.theme.accentColor + '30'
                    : 'rgba(255,255,255,0.08)',
                borderColor:
                  appearance.face === f
                    ? preset.theme.accentColor
                    : preset.theme.borderColor,
                color:
                  appearance.face === f
                    ? preset.theme.accentColor
                    : preset.theme.textColor,
              }}
            >
              {FACE_STYLE_LABEL[f]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
