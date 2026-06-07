import type { CharacterMenuPreset } from '../types';

type CharacterMenuHeaderProps = {
  onClose: () => void;
  onReset: () => void;
  preset: CharacterMenuPreset;
  compact?: boolean;
};

export function CharacterMenuHeader({
  onClose,
  onReset,
  preset,
  compact,
}: CharacterMenuHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-3 mb-4">
      <h2
        className={compact ? 'text-sm font-bold' : 'text-lg font-bold'}
        style={{ color: preset.theme.textColor }}
      >
        ✨ 캐릭터 꾸미기
      </h2>
      <div className="flex gap-2">
        <button
          onClick={onReset}
          className="px-3 py-1 rounded-lg border text-xs font-semibold transition-colors hover:opacity-80"
          style={{
            background: 'rgba(255,255,255,0.08)',
            borderColor: preset.theme.borderColor,
            color: preset.theme.textColor,
          }}
        >
          초기화
        </button>
        <button
          onClick={onClose}
          className="px-3 py-1 rounded-lg border text-xs font-semibold transition-colors hover:opacity-80"
          style={{
            background: preset.theme.accentColor + '20',
            borderColor: preset.theme.accentColor,
            color: preset.theme.accentColor,
          }}
        >
          닫기
        </button>
      </div>
    </header>
  );
}
