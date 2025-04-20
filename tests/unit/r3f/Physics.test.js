import { RigidBody } from '@react-three/rapier';
import { renderWithPhysics } from '../../utils/r3fTestUtils';

// 간단한 물리 테스트 컴포넌트
const PhysicsTestComponent = ({ position = [0, 0, 0], type = 'dynamic' }) => (
  <RigidBody position={position} type={type}>
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="blue" />
    </mesh>
  </RigidBody>
);

// 바닥 컴포넌트
const Ground = () => (
  <RigidBody type="fixed" position={[0, -1, 0]}>
    <mesh>
      <boxGeometry args={[10, 0.5, 10]} />
      <meshStandardMaterial color="green" />
    </mesh>
  </RigidBody>
);

describe('Physics Tests', () => {
  it('renders physics components', async () => {
    // 물리 컴포넌트 렌더링
    const mounted = await renderWithPhysics(<PhysicsTestComponent position={[0, 5, 0]} />);

    // 렌더링 확인
    expect(mounted).toBeDefined();
    expect(mounted.scene).toBeDefined();

    // RigidBody가 렌더링 되었는지 확인
    const rigidBody = mounted.scene.findByType('RigidBody');
    expect(rigidBody).toBeDefined();

    // mesh가 렌더링 되었는지 확인
    const mesh = mounted.scene.findByType('mesh');
    expect(mesh).toBeDefined();
  });

  it('renders with different body types', async () => {
    // 다양한 RigidBody 타입으로 테스트
    const types = ['dynamic', 'fixed', 'kinematicPosition', 'kinematicVelocity'];

    for (const type of types) {
      // 지정된 타입으로 컴포넌트 렌더링
      const mounted = await renderWithPhysics(<PhysicsTestComponent type={type} />);

      // 렌더링 확인
      expect(mounted).toBeDefined();
      expect(mounted.scene).toBeDefined();

      // RigidBody가 렌더링 되었는지 확인
      const rigidBody = mounted.scene.findByType('RigidBody');
      expect(rigidBody).toBeDefined();
    }
  });

  it('renders multiple physics objects', async () => {
    // 여러 물리 객체 렌더링
    const mounted = await renderWithPhysics(
      <>
        <PhysicsTestComponent position={[0, 5, 0]} />
        <PhysicsTestComponent position={[2, 5, 0]} />
        <PhysicsTestComponent position={[-2, 5, 0]} />
        <Ground />
      </>,
    );

    // 렌더링 확인
    expect(mounted).toBeDefined();
    expect(mounted.scene).toBeDefined();

    // 모든 mesh가 렌더링 되었는지 확인
    const meshes = mounted.scene.findAllByType('mesh');
    expect(meshes.length).toBe(4); // 3개의 PhysicsTestComponent + 1개의 Ground
  });
});
