export type callbackType = {
  onReady?: () => void;
  onFrame?: () => void;
  onDestory?: () => void;
  onAnimate?: () => void;
};

export type componentTypeString = 'character' | 'vehicle' | 'airplane' | 'passive';

export type initCallbackProps = {
  props: any;
  actions: any;
  componentType: componentTypeString;
};

export default function initCallback({ props, actions, componentType }: initCallbackProps) {
  if (props.onReady) {
    props.onReady();
  }

  if (props.onFrame) {
    props.onFrame();
  }

  if (props.onAnimate && actions) {
    props.onAnimate();
  }
} 