import { useEffect, useMemo, useState } from 'react';

import {
  useAssetStore,
  type AssetRecord,
} from '../../../assets';
import { useCharacterStore } from '../../stores/characterStore';
import {
  type AppearanceColors,
  type FaceStyle,
  type HairStyle,
  type OutfitSlot,
} from '../../types';
import { requestCameraCloseUp, restoreCameraCloseUp } from '../../../camera/closeUp';
import type { CharacterMenuProps } from './types';

const COLOR_KEYS: { key: keyof AppearanceColors; label: string }[] = [
  { key: 'body', label: '피부' },
  { key: 'hair', label: '머리' },
  { key: 'hat', label: '모자' },
  { key: 'top', label: '상의' },
  { key: 'bottom', label: '하의' },
  { key: 'shoes', label: '신발' },
];

const HAIR_OPTIONS: HairStyle[] = ['short', 'long', 'cap', 'bun', 'spiky'];
const FACE_OPTIONS: FaceStyle[] = ['default', 'smile', 'wink', 'sleepy', 'surprised'];
const SLOTS: OutfitSlot[] = ['hat', 'top', 'bottom', 'shoes', 'weapon'];

const OUTFIT_SLOT_LABEL: Record<OutfitSlot, string> = {
  hat: '모자',
  top: '상의',
  bottom: '하의',
  shoes: '신발',
  weapon: '무기',
  face: '얼굴',
  glasses: '안경',
  accessory: '악세사리',
};

const HAIR_STYLE_LABEL: Record<HairStyle, string> = {
  short: '숏컷',
  long: '롱',
  cap: '캡',
  bun: '뭉뭉이',
  spiky: '뾰족이',
};

const FACE_STYLE_LABEL: Record<FaceStyle, string> = {
  default: '기본',
  smile: '웃음',
  wink: '윙크',
  sleepy: '졸린',
  surprised: '깜놀',
};

const matchesSlot = (asset: AssetRecord, slot: OutfitSlot) => {
  if (slot === 'weapon') return asset.kind === 'weapon' || asset.slot === 'weapon';
  return asset.slot === slot && (asset.kind === 'characterPart' || asset.kind === 'weapon');
};

export function CharacterMenu({ toggleKey, open, onClose }: CharacterMenuProps = {}) {
  const controlled = typeof open === 'boolean';
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlled ? open : internalOpen;

  const [previewMode, setPreviewMode] = useState<"normal" | "closeUp">("normal");
  const [zoom, setZoom] = useState(1);

  const appearance = useCharacterStore((s) => s.appearance);
  const outfits = useCharacterStore((s) => s.outfits);
  const setName = useCharacterStore((s) => s.setName);
  const setColor = useCharacterStore((s) => s.setColor);
  const setHair = useCharacterStore((s) => s.setHair);
  const setFace = useCharacterStore((s) => s.setFace);
  const equipOutfit = useCharacterStore((s) => s.equipOutfit);
  const resetAppearance = useCharacterStore((s) => s.resetAppearance);
  const assetIds = useAssetStore((s) => s.ids);
  const assetRecords = useAssetStore((s) => s.records);

  const assetsBySlot = useMemo(() => {
    return SLOTS.reduce((acc, slot) => {
      acc[slot] = assetIds
        .map((id) => assetRecords[id])
        .filter((asset): asset is AssetRecord => Boolean(asset))
        .filter((asset) => matchesSlot(asset, slot));
      return acc;
    }, {} as Record<OutfitSlot, AssetRecord[]>);
  }, [assetIds, assetRecords]);

  useEffect(() => {
    if (!toggleKey || controlled) return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      const wantedKey = toggleKey.toLowerCase();
      const wantedCode = `Key${toggleKey.toUpperCase()}`;
      if (e.code !== wantedCode && e.key.toLowerCase() !== wantedKey) return;
      setInternalOpen((v) => !v);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggleKey, controlled]);

  const handleClose = () => {
    if (previewMode === "closeUp") {
      restoreCameraCloseUp();
      setPreviewMode("normal");
    }
    if (controlled) onClose?.();
    else setInternalOpen(false);
  };

  const handleCloseUpClick = () => {
    if (previewMode === "closeUp") {
      restoreCameraCloseUp();
      setPreviewMode("normal");
    } else {
      requestCameraCloseUp([0, 1.7, 3], {
        focusDistance: 3,
        focusLerpSpeed: 8,
        fov: 50,
      });
      setPreviewMode("closeUp");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[130] flex items-center justify-center"
      style={{
        background: previewMode === "closeUp" ? "transparent" : "rgba(0,0,0,0.32)",
        backdropFilter: previewMode === "closeUp" ? "none" : "blur(4px)",
        pointerEvents: previewMode === "closeUp" ? "none" : "auto",
      }}
      onClick={previewMode === "closeUp" ? undefined : handleClose}
    >
      {previewMode !== "closeUp" && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="rounded-2xl border overflow-y-auto max-h-[90vh] w-[min(900px,95vw)]"
          style={{
            background: 'rgba(18,20,28,0.92)',
            borderColor: 'rgba(255,255,255,0.15)',
            color: '#f3f4f8',
            padding: 24,
            boxShadow: '0 12px 28px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold">✨ 캐릭터 꾸미기</h2>
            <div className="flex gap-2">
              <button
                onClick={resetAppearance}
                className="px-3 py-1 rounded-lg border text-xs font-semibold"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  borderColor: 'rgba(255,255,255,0.14)',
                  color: '#f3f4f8',
                }}
              >
                초기화
              </button>
              <button
                onClick={handleClose}
                className="px-3 py-1 rounded-lg border text-xs font-semibold"
                style={{
                  background: 'rgba(122,223,144,0.2)',
                  borderColor: '#7adf90',
                  color: '#7adf90',
                }}
              >
                닫기
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* 왼쪽: 미리보기 + 줌 + 클로즈업 */}
            <div className="flex flex-col gap-4">
              {/* 미리보기 */}
              <div
                className="p-4 rounded-lg border aspect-square flex items-center justify-center"
                style={{
                  background: 'radial-gradient(circle, rgba(255,255,255,0.05), rgba(0,0,0,0.2))',
                  borderColor: 'rgba(255,255,255,0.10)',
                }}
              >
                <div style={{ fontSize: '4rem', opacity: 0.5, transform: `scale(${zoom})` }}>
                  🧍
                </div>
              </div>

              {/* 줌 제어 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setZoom((prev) => Math.max(0.5, prev - 0.2))}
                    className="px-2 py-1 rounded-lg border text-xs font-semibold"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      borderColor: 'rgba(255,255,255,0.14)',
                      color: '#f3f4f8',
                    }}
                  >
                    −
                  </button>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.1"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <button
                    onClick={() => setZoom((prev) => Math.min(3, prev + 0.2))}
                    className="px-2 py-1 rounded-lg border text-xs font-semibold"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      borderColor: 'rgba(255,255,255,0.14)',
                      color: '#f3f4f8',
                    }}
                  >
                    ＋
                  </button>
                </div>
                <span className="text-xs text-center opacity-60">{Math.round(zoom * 100)}%</span>
              </div>

              {/* 클로즈업 */}
              <button
                onClick={handleCloseUpClick}
                className="w-full px-3 py-2 rounded-lg border text-xs font-bold transition-all"
                style={{
                  background:
                    (previewMode as any) === "closeUp"
                      ? "rgba(122,223,144,0.2)"
                      : "rgba(255,255,255,0.06)",
                  borderColor: (previewMode as any) === "closeUp" ? "#7adf90" : "rgba(255,255,255,0.14)",
                  color: (previewMode as any) === "closeUp" ? "#7adf90" : "#f3f4f8",
                }}
              >
                {(previewMode as any) === "closeUp" ? "❌ 해제" : "🔍 클로즈업"}
              </button>
            </div>

            {/* 오른쪽: 커스터마이징 */}
            <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
              {/* 이름 */}
              <div className="p-3 rounded-lg border" style={{ borderColor: 'rgba(255,255,255,0.10)' }}>
                <label className="text-xs font-bold uppercase opacity-60 block mb-2">이름</label>
                <input
                  value={appearance.name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={16}
                  className="w-full px-2 py-1 rounded text-sm"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    borderColor: 'rgba(255,255,255,0.14)',
                    color: '#f3f4f8',
                    border: '1px solid rgba(255,255,255,0.14)',
                  }}
                />
              </div>

              {/* 색상 */}
              <div className="p-3 rounded-lg border" style={{ borderColor: 'rgba(255,255,255,0.10)' }}>
                <label className="text-xs font-bold uppercase opacity-60 block mb-2">색상</label>
                <div className="space-y-2">
                  {COLOR_KEYS.map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between gap-2">
                      <span className="text-sm">{label}</span>
                      <input
                        type="color"
                        value={appearance.colors[key]}
                        onChange={(e) => setColor(key, e.target.value)}
                        className="w-10 h-8 rounded cursor-pointer"
                        style={{ border: '1px solid #7adf90' }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* 헤어 */}
              <div className="p-3 rounded-lg border" style={{ borderColor: 'rgba(255,255,255,0.10)' }}>
                <label className="text-xs font-bold uppercase opacity-60 block mb-2">헤어</label>
                <div className="flex flex-wrap gap-2">
                  {HAIR_OPTIONS.map((h) => (
                    <button
                      key={h}
                      onClick={() => setHair(h)}
                      className="px-2 py-1 rounded-full border text-xs font-semibold"
                      style={{
                        background:
                          appearance.hair === h ? 'rgba(122,223,144,0.2)' : 'rgba(255,255,255,0.06)',
                        borderColor: appearance.hair === h ? '#7adf90' : 'rgba(255,255,255,0.14)',
                        color: appearance.hair === h ? '#7adf90' : '#f3f4f8',
                      }}
                    >
                      {HAIR_STYLE_LABEL[h]}
                    </button>
                  ))}
                </div>
              </div>

              {/* 표정 */}
              <div className="p-3 rounded-lg border" style={{ borderColor: 'rgba(255,255,255,0.10)' }}>
                <label className="text-xs font-bold uppercase opacity-60 block mb-2">표정</label>
                <div className="flex flex-wrap gap-2">
                  {FACE_OPTIONS.map((f) => (
                    <button
                      key={f}
                      onClick={() => setFace(f)}
                      className="px-2 py-1 rounded-full border text-xs font-semibold"
                      style={{
                        background:
                          appearance.face === f ? 'rgba(122,223,144,0.2)' : 'rgba(255,255,255,0.06)',
                        borderColor: appearance.face === f ? '#7adf90' : 'rgba(255,255,255,0.14)',
                        color: appearance.face === f ? '#7adf90' : '#f3f4f8',
                      }}
                    >
                      {FACE_STYLE_LABEL[f]}
                    </button>
                  ))}
                </div>
              </div>

              {/* 장비 */}
              <div className="space-y-2">
                {SLOTS.map((slot) => (
                  <div
                    key={slot}
                    className="p-3 rounded-lg border"
                    style={{ borderColor: 'rgba(255,255,255,0.10)' }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold">{OUTFIT_SLOT_LABEL[slot]}</span>
                      {outfits[slot] && (
                        <button
                          onClick={() => equipOutfit(slot, null)}
                          className="text-xs px-2 py-0.5 rounded border"
                          style={{
                            background: 'rgba(255,255,255,0.06)',
                            borderColor: 'rgba(255,255,255,0.14)',
                            color: '#f3f4f8',
                          }}
                        >
                          해제
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {assetsBySlot[slot].map((asset) => (
                        <button
                          key={asset.id}
                          onClick={() => equipOutfit(slot, asset.id)}
                          className="aspect-square rounded border overflow-hidden"
                          title={asset.name}
                          style={{
                            borderColor:
                              outfits[slot] === asset.id
                                ? '#7adf90'
                                : 'rgba(255,255,255,0.10)',
                            background:
                              outfits[slot] === asset.id
                                ? 'rgba(122,223,144,0.1)'
                                : 'rgba(255,255,255,0.04)',
                          }}
                        >
                          <div className="w-full h-full flex items-center justify-center text-xs">
                            {asset.name.charAt(0)}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {previewMode === "closeUp" && (
        <button
          onClick={handleCloseUpClick}
          className="fixed inset-0 z-[125]"
          style={{ background: "transparent" }}
        />
      )}
    </div>
  );
}

export type { CharacterMenuProps };
