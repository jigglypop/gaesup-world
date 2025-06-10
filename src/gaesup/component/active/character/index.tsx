import { controllerInnerType, refsType } from '../../../controller/type';
import { ResourceUrlsType } from '../../../atoms';
import { OuterGroupRef } from '../../inner/common/OuterGroupRef';
import { RigidBodyRef } from '../../inner/common/RigidbodyRef';
import { CharacterRefProps } from './types';

export function CharacterRef({ children, props, refs, urls }: CharacterRefProps) {
  return (
    <OuterGroupRef ref={refs.outerGroupRef}>
      <RigidBodyRef
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
        ref={refs.rigidBodyRef}
        outerGroupRef={refs.outerGroupRef}
        innerGroupRef={refs.innerGroupRef}
        colliderRef={refs.colliderRef}
      >
        {children}
      </RigidBodyRef>
    </OuterGroupRef>
  );
}
