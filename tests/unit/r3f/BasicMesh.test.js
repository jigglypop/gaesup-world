/** @jest-environment jsdom */
import { renderWithR3f } from '../../utils/r3fTestUtils';

// 간단한 테스트용 메시 컴포넌트
const TestCube = ({ position = [0, 0, 0], color = 'red', scale = [1, 1, 1] }) => {
  return (
    <mesh position={position} scale={scale}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

describe('Basic R3F Component Tests', () => {
  it('renders a mesh component', async () => {
    // 컴포넌트 렌더링
    const renderer = await renderWithR3f(<TestCube />);

    // 렌더러와 루트 엘리먼트 확인
    expect(renderer).toBeDefined();
    expect(renderer.root).toBeDefined();

    // mesh 컴포넌트 검색
    const mesh = renderer.root.findByType('mesh');
    expect(mesh).toBeDefined();
  });

  it('renders with correct props', async () => {
    // 테스트 속성 설정
    const testProps = {
      position: [1, 2, 3],
      color: 'blue',
      scale: [2, 1, 3],
    };

    // 컴포넌트 렌더링
    const renderer = await renderWithR3f(<TestCube {...testProps} />);

    // 컴포넌트 검색
    const mesh = renderer.root.findByType('mesh');
    expect(mesh).toBeDefined();

    // 메쉬 내 material 검색
    const material = renderer.root.findByType('meshStandardMaterial');
    expect(material).toBeDefined();
    expect(material.props.color).toBe(testProps.color);

    // 메쉬 내 geometry 검색
    const geometry = renderer.root.findByType('boxGeometry');
    expect(geometry).toBeDefined();
    expect(geometry.props.args).toEqual([1, 1, 1]);

    // 속성 확인
    expect(mesh.props.position).toEqual(testProps.position);
    expect(mesh.props.scale).toEqual(testProps.scale);
  });
});
