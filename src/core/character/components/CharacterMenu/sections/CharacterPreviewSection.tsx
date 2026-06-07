import type { CharacterMenuPreset, CharacterPreviewMode } from '../types';

type CharacterPreviewSectionProps = {
  zoom: number;
  previewMode: CharacterPreviewMode;
  onZoom: (delta: number) => void;
  onCloseUp: () => void;
  onRotate?: (angle: number) => void;
  preset: CharacterMenuPreset;
};

export function CharacterPreviewSection({
  zoom,
  previewMode,
  onZoom,
  onCloseUp,
  onRotate,
  preset,
}: CharacterPreviewSectionProps) {
  return (
    <div
      className="p-4 rounded-xl border"
      style={{
        background: 'rgba(0,0,0,0.2)',
        borderColor: preset.theme.borderColor,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold uppercase opacity-60">미리보기</p>
        <span
          className="text-sm font-semibold px-2 py-1 rounded"
          style={{
            background: preset.theme.accentColor + '20',
            color: preset.theme.accentColor,
          }}
        >
          {Math.round(zoom * 100)}%
        </span>
      </div>

      <div
        className="relative w-full aspect-square rounded-lg border mb-3 flex items-center justify-center overflow-hidden"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.05), rgba(0,0,0,0.2))',
          borderColor: preset.theme.borderColor,
        }}
      >
        <div
          style={{
            fontSize: '3rem',
            opacity: 0.5,
            transform: `scale(${zoom}) rotateY(45deg)`,
          }}
        >
          🧍
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onZoom(-0.2)}
            className="px-2 py-1 rounded-lg border text-xs font-semibold transition-colors"
            style={{
              background: 'rgba(255,255,255,0.08)',
              borderColor: preset.theme.borderColor,
              color: preset.theme.textColor,
            }}
            disabled={zoom <= 0.5}
          >
            -
          </button>

          <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            value={zoom}
            onChange={(e) => {
              const newZoom = parseFloat(e.target.value);
              const delta = newZoom - zoom;
              onZoom(delta);
            }}
            className="flex-1"
            style={{
              accentColor: preset.theme.accentColor,
            }}
          />

          <button
            onClick={() => onZoom(0.2)}
            className="px-2 py-1 rounded-lg border text-xs font-semibold transition-colors"
            style={{
              background: 'rgba(255,255,255,0.08)',
              borderColor: preset.theme.borderColor,
              color: preset.theme.textColor,
            }}
            disabled={zoom >= 3}
          >
            +
          </button>
        </div>

        {onRotate && (
          <div className="flex gap-2">
            <button
              onClick={() => onRotate(-45)}
              className="flex-1 px-2 py-2 rounded-lg border text-xs font-semibold transition-colors"
              style={{
                background: 'rgba(255,255,255,0.08)',
                borderColor: preset.theme.borderColor,
                color: preset.theme.textColor,
              }}
            >
              ⬅️
            </button>
            <button
              onClick={() => onRotate(45)}
              className="flex-1 px-2 py-2 rounded-lg border text-xs font-semibold transition-colors"
              style={{
                background: 'rgba(255,255,255,0.08)',
                borderColor: preset.theme.borderColor,
                color: preset.theme.textColor,
              }}
            >
              ➡️
            </button>
          </div>
        )}

        <button
          onClick={onCloseUp}
          className="w-full px-3 py-2 rounded-lg border text-xs font-bold transition-all"
          style={{
            background:
              previewMode === 'closeUp'
                ? preset.theme.accentColor + '40'
                : 'rgba(255,255,255,0.08)',
            borderColor:
              previewMode === 'closeUp'
                ? preset.theme.accentColor
                : preset.theme.borderColor,
            color:
              previewMode === 'closeUp'
                ? preset.theme.accentColor
                : preset.theme.textColor,
          }}
        >
          {previewMode === 'closeUp' ? '❌ 클로즈업 해제' : '🔍 클로즈업'}
        </button>
      </div>
    </div>
  );
}
