export type keyMapItemType = {
  name: string;
  gridRow: string;
  gridColumn: string;
  code?: string;
};

export type keyArrayItemType = {
  code: string;
  gridRow: string;
  gridColumn: string;
  name: string;
};

export type keyBoardMapType = {
  [name: string]: keyMapItemType;
};

export const KeyboardF = {
  ESC: { name: 'ESC', gridRow: '1/2', gridColumn: '1/2' },
  F1: { name: 'F1', gridRow: '1/2', gridColumn: '3/4' },
  F2: { name: 'F2', gridRow: '1/2', gridColumn: '4/5' },
  F3: { name: 'F3', gridRow: '1/2', gridColumn: '5/6' },
  F4: { name: 'F4', gridRow: '1/2', gridColumn: '6/7' },
  F5: { name: 'F5', gridRow: '1/2', gridColumn: '8/9' },
  F6: { name: 'F6', gridRow: '1/2', gridColumn: '9/10' },
  F7: { name: 'F7', gridRow: '1/2', gridColumn: '10/11' },
  F8: { name: 'F8', gridRow: '1/2', gridColumn: '11/12' },
  F9: { name: 'F9', gridRow: '1/2', gridColumn: '13/14' },
  F10: { name: 'F10', gridRow: '1/2', gridColumn: '14/15' },
  F11: { name: 'F11', gridRow: '1/2', gridColumn: '15/16' },
  F12: { name: 'F12', gridRow: '1/2', gridColumn: '16/17' }
};

export const KeyboardOne = {
  Backquote: { name: '`', gridRow: '2/3', gridColumn: '1/3' },
  Digit1: { name: '1', gridRow: '2/3', gridColumn: '3/4' },
  Digit2: { name: '2', gridRow: '2/3', gridColumn: '4/5' },
  Digit3: { name: '3', gridRow: '2/3', gridColumn: '5/6' },
  Digit4: { name: '4', gridRow: '2/3', gridColumn: '6/7' },
  Digit5: { name: '5', gridRow: '2/3', gridColumn: '7/8' },
  Digit6: { name: '6', gridRow: '2/3', gridColumn: '8/9' },
  Digit7: { name: '7', gridRow: '2/3', gridColumn: '9/10' },
  Digit8: { name: '8', gridRow: '2/3', gridColumn: '10/11' },
  Digit9: { name: '9', gridRow: '2/3', gridColumn: '11/12' },
  Digit0: { name: '0', gridRow: '2/3', gridColumn: '12/13' },
  Minus: { name: '-', gridRow: '2/3', gridColumn: '13/14' },
  Equal: { name: '=', gridRow: '2/3', gridColumn: '14/15' },
  Backspace: { name: 'Backspace', gridRow: '2/3', gridColumn: '15/17' }
};

export const KeyboardTwo = {
  Tab: { name: 'Tab', gridRow: '3/4', gridColumn: '1/3' },
  KeyQ: { name: 'Q', gridRow: '3/4', gridColumn: '3/4' },
  KeyW: { name: 'W', gridRow: '3/4', gridColumn: '4/5' },
  KeyE: { name: 'E', gridRow: '3/4', gridColumn: '5/6' },
  KeyR: { name: 'R', gridRow: '3/4', gridColumn: '6/7' },
  KeyT: { name: 'T', gridRow: '3/4', gridColumn: '7/8' },
  KeyY: { name: 'Y', gridRow: '3/4', gridColumn: '8/9' },
  KeyU: { name: 'U', gridRow: '3/4', gridColumn: '9/10' },
  KeyI: { name: 'I', gridRow: '3/4', gridColumn: '10/11' },
  KeyO: { name: 'O', gridRow: '3/4', gridColumn: '11/12' },
  KeyP: { name: 'P', gridRow: '3/4', gridColumn: '12/13' },
  BracketLeft: { name: '[', gridRow: '3/4', gridColumn: '13/14' },
  BracketRight: { name: ']', gridRow: '3/4', gridColumn: '14/15' },
  Backslash: { name: '\\', gridRow: '3/4', gridColumn: '15/17' }
};

export const KeyboardThree = {
  CapsLock: { name: 'CapsLock', gridRow: '4/5', gridColumn: '1/3' },
  KeyA: { name: 'A', gridRow: '4/5', gridColumn: '3/4' },
  KeyS: { name: 'S', gridRow: '4/5', gridColumn: '4/5' },
  KeyD: { name: 'D', gridRow: '4/5', gridColumn: '5/6' },
  KeyF: { name: 'F', gridRow: '4/5', gridColumn: '6/7' },
  KeyG: { name: 'G', gridRow: '4/5', gridColumn: '7/8' },
  KeyH: { name: 'H', gridRow: '4/5', gridColumn: '8/9' },
  KeyJ: { name: 'J', gridRow: '4/5', gridColumn: '9/10' },
  KeyK: { name: 'K', gridRow: '4/5', gridColumn: '10/11' },
  KeyL: { name: 'L', gridRow: '4/5', gridColumn: '11/12' },
  Semicolon: { name: ';', gridRow: '4/5', gridColumn: '12/13' },
  Quote: { name: "'", gridRow: '4/5', gridColumn: '13/14' },
  Enter: { name: 'Enter', gridRow: '4/5', gridColumn: '14/17' }
};

export const KeyboardFour = {
  ShiftLeft: {
    name: 'Shift',
    gridRow: '5/6',
    gridColumn: '1/4',
    code: 'Shift'
  },
  KeyZ: { name: 'Z', gridRow: '5/6', gridColumn: '4/5' },
  KeyX: { name: 'X', gridRow: '5/6', gridColumn: '5/6' },
  KeyC: { name: 'C', gridRow: '5/6', gridColumn: '6/7' },
  KeyV: { name: 'V', gridRow: '5/6', gridColumn: '7/8' },
  KeyB: { name: 'B', gridRow: '5/6', gridColumn: '8/9' },
  KeyN: { name: 'N', gridRow: '5/6', gridColumn: '9/10' },
  KeyM: { name: 'M', gridRow: '5/6', gridColumn: '10/11' },
  Comma: { name: ',', gridRow: '5/6', gridColumn: '11/12' },
  Period: { name: '.', gridRow: '5/6', gridColumn: '12/13' },
  Slash: { name: '/', gridRow: '5/6', gridColumn: '13/14' },
  ShiftRight: {
    name: 'Shift',
    gridRow: '5/6',
    gridColumn: '14/17',
    code: 'Shift'
  }
};

export const KeyboardFive = {
  ControlLeft: {
    name: 'Control',
    gridRow: '6/7',
    gridColumn: '1/3',
    code: 'Control'
  },
  Option: { name: 'Option', gridRow: '6/7', gridColumn: '3/5' },
  AltLeft: { name: 'Alt', gridRow: '6/7', gridColumn: '5/7', code: 'Alt' },
  Space: { name: 'Space', gridRow: '6/7', gridColumn: '7/13' },
  AltRight: { name: 'Alt', gridRow: '6/7', gridColumn: '13/15', code: 'Alt' },
  ControlRight: {
    name: 'Control',
    gridRow: '6/7',
    gridColumn: '15/17',
    code: 'Control'
  }
};

export const KeyboardArrow = {
  ArrowUp: { name: 'Up', gridRow: '5/6', gridColumn: '19/20' },
  ArrowLeft: { name: 'Left', gridRow: '6/7', gridColumn: '18/19' },
  ArrowDown: { name: 'Down', gridRow: '6/7', gridColumn: '19/20' },
  ArrowRight: { name: 'Right', gridRow: '6/7', gridColumn: '20/21' }
};

export const KeyBoardAll: keyBoardMapType = {
  ...KeyboardF,
  ...KeyboardOne,
  ...KeyboardTwo,
  ...KeyboardThree,
  ...KeyboardFour,
  ...KeyboardFive,
  ...KeyboardArrow
};
