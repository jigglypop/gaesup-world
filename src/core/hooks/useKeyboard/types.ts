export type KeyboardResult = {
  pressedKeys: string[];
  pushKey: (key: string, value: boolean) => boolean;
  isKeyPressed: (key: string) => boolean;
  clearAllKeys: () => void;
};

export type KeyboardOptions = {
  preventDefault?: boolean;
  enableClicker?: boolean;
  customKeyMapping?: Record<string, string>;
};
