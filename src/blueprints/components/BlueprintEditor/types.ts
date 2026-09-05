export type BlueprintEditorProps = {
  onClose: () => void;
};

export type BlueprintType = 'character' | 'vehicle' | 'airplane' | 'animation' | 'behavior' | 'item';

export type BlueprintCategory = {
  id: string;
  name: string;
  type: BlueprintType;
  count: number;
}; 