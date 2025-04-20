import { controllerInnerType, refsType } from '../../../controller/type';
import { urlsType } from '../../../world/context/type';
import { CharacterInnerRef } from '../../inner/character';

export function CharacterRef({
  children,
  props,
  refs,
  urls,
}: {
  children: React.ReactNode;
  props: controllerInnerType;
  refs: refsType;
  urls: urlsType;
}) {
  return (
    <CharacterInnerRef
      url={urls.characterUrl}
      isActive={true}
      componentType="character"
      rigidbodyType={'dynamic'}
      controllerOptions={props.controllerOptions}
      groundRay={props.groundRay}
      onAnimate={props.onAnimate}
      onFrame={props.onFrame}
      onReady={props.onReady}
      onDestory={props.onDestory}
      rigidBodyProps={props.rigidBodyProps}
      parts={props.parts}
      {...refs}
    >
      {children}
    </CharacterInnerRef>
  );
}
