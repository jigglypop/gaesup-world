export type AssetKind =
  | 'characterPart'
  | 'weapon'
  | 'material'
  | 'tile'
  | 'wall'
  | 'object3d';

export type AssetSlot =
  | 'body'
  | 'hair'
  | 'hat'
  | 'top'
  | 'bottom'
  | 'shoes'
  | 'face'
  | 'weapon'
  | 'shield'
  | 'accessory'
  | 'glasses';

export type AssetColorMap = {
  primary?: string;
  secondary?: string;
  accent?: string;
};

export type AssetRecord = {
  id: string;
  name: string;
  kind: AssetKind;
  slot?: AssetSlot;
  url?: string;
  thumbnailUrl?: string;
  previewUrl?: string;
  tags?: string[];
  colors?: AssetColorMap;
  metadata?: Record<string, unknown>;
};

export type AssetQuery = {
  kind?: AssetKind;
  slot?: AssetSlot;
  tag?: string;
};

export type AssetSource = {
  listAssets: (query?: AssetQuery) => Promise<AssetRecord[]>;
  getAsset: (id: string) => Promise<AssetRecord | undefined>;
  listByKind: (kind: AssetKind) => Promise<AssetRecord[]>;
  listBySlot: (slot: AssetSlot) => Promise<AssetRecord[]>;
};
