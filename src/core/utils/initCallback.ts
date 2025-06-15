export function initCallback({ props, actions }: { props: any; actions: any }) {
  if (props.onReady) props.onReady();
  if (props.onFrame) props.onFrame();
  if (props.onAnimate && actions) props.onAnimate();
}
