import { componentTypeString } from '../component/types';

export function initCallback({
  props,
  actions,
  componentType,
}: {
  props: any;
  actions: any;
  componentType: componentTypeString;
}) {
  if (props.onReady) props.onReady();
  if (props.onFrame) props.onFrame();
  if (props.onAnimate && actions) props.onAnimate();
}
