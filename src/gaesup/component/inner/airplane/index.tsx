import { OuterGroupRef } from '../common/OuterGroupRef';
import { RigidBodyRef } from '../common/RigidbodyRef';
import { airplaneInnerType } from './types';

export function AirplaneInnerRef(props: airplaneInnerType) {
  const { rigidBodyRef, outerGroupRef } = props;

  return (
    <OuterGroupRef ref={outerGroupRef}>
      <RigidBodyRef
        ref={rigidBodyRef}
        name={props.name}
        componentType={'airplane'}
        ridingUrl={props.ridingUrl}
        {...props}
      >
        {props.children}
      </RigidBodyRef>
    </OuterGroupRef>
  );
}
