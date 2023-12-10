export type controlType = {
  forward: boolean;
  backward: boolean;
  leftward: boolean;
  rightward: boolean;
  [key: string]: boolean;
};

export type keyControlType = {
  [key: string]: boolean;
};
