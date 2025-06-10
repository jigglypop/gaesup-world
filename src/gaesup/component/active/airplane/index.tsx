import { OuterGroupRef } from '../../inner/common/OuterGroupRef';
import { RigidBodyRef } from '../../inner/common/RigidbodyRef';
import { activeAirplaneInnerType } from './type';

export function AirplaneRef(props: activeAirplaneInnerType) {
  return (
    <OuterGroupRef ref={props.outerGroupRef}>
      <RigidBodyRef
        name={'airplane'}
        isActive={true}
        currentAnimation={'idle'}
        componentType={'airplane'}
        ridingUrl={props.ridingUrl}
        ref={props.rigidBodyRef}
        outerGroupRef={props.outerGroupRef}
        innerGroupRef={props.innerGroupRef}
        colliderRef={props.colliderRef}
        {...props}
      >
        {props.children}
      </RigidBodyRef>
    </OuterGroupRef>
  );
}
