# Forest showcase and GPU-driven instances

실행: `pnpm dev` → 기본 주소 <http://127.0.0.1:5174/engine>. 포트를 이미 사용 중이면 터미널에 표시된 주소 뒤에 `/engine`을 붙인다. 첫 화면 `/`는 [3D 미니홈피](minihome.md)다.

숲 탐험, 호숫가·항공 카메라, 낮·노을, 자동 회전, 모바일 레이아웃을 제공한다. **엔진 살펴보기**에서 4,096 / 16,384 / 65,536개 나무와 전체 제출 / CPU 컬링 / GPU 간접 드로우를 비교한다. 공개 패키지 검사 버튼은 16개 JS subpath와 CSS를 실제로 지연 로드한다. 이는 각 도메인의 게임플레이 검증을 대신하지 않는다.

`examples/engine/forest.ts`는 공개 `NextWorld`의 SoA transform에 고정 seed로 배치한다. `scene.ts`는 공개 `TaskGraph`로 카메라·애니메이션·컬링·렌더 순서를 관리한다. 예제는 공개 `gaesup-world/*` 경계만 사용한다. 외부 모델 없이 생성한 테스트 숲이며 완성된 캐릭터/멀티플레이 게임은 아니다.

## 구현한 성능 변경

- `cullAndCompactSpheres`: 가시성 판정과 원본 인덱스 압축을 한 번의 순회로 처리한다. 호출자가 출력 배열을 재사용하며, 중간 visibility 배열과 두 번째 순회가 필요 없다. 입력 개수·버퍼 용량·반지름을 검사한다.
- 카메라가 정지한 경우 컬링과 instance matrix 업로드를 생략한다. 전체 렌더링 모드의 정적 행렬은 카메라 이동과 무관하게 한 번만 올린다.
- 기존 건물 업로드는 공간 데이터와 indirect argument의 버전을 각각 추적하여 중복 업로드를 생략한다. device가 바뀌면 dirty range가 비어 있어도 새 버퍼 전체를 채운다. 교체 할당·업로드 실패 시 새 버퍼를 회수하고 이전 리소스 소유권을 유지한다. 기존 버퍼에 대한 부분 쓰기는 GPU transaction이 아니므로 실패 후 재시도가 필요하다.
- 예제의 3D 엔진과 공개 API 검사기를 지연 로드한다. 강제 vendor grouping으로 생기던 공유 chunk 결합을 제거했다. production manifest와 source map으로 첫 UI와 숲 경로에 editor/building/physics 모듈이 들어오지 않는지 검사한다.

CPU 측정은 `node scripts/benchmark-culling.cjs`로 재현한다. 10만 개 고정 seed, 50회 워밍업, 순서를 교차한 200회 측정, 두 경로의 출력 인덱스 완전 일치를 확인한다. 결과는 `.tmp/engine-showcase/culling-benchmark.json`에 기록된다. 이 수치는 Node CPU 마이크로벤치마크이며 브라우저 FPS 개선률이 아니다. 제거한 중간 버퍼는 100,000바이트다.

## WebGPU 경로와 API 계약

```ts
import { createGpuDrivenInstances, extractFrustumPlanes } from 'gaesup-world/next';

const instances = await createGpuDrivenInstances({
  renderer, // init() 완료한 Three WebGPURenderer
  geometry,
  positions, // xyz Float32Array, 생성 후 변경하지 않음
  radius, // geometry 원점으로부터 전체 형상을 포함하는 구 반지름
});
if (instances) {
  scene.add(instances.mesh);
  // 매 프레임: 카메라 갱신 → viewProjection → 정규화한 6개 평면
  extractFrustumPlanes(viewProjection, planes, true);
  instances.update(planes);
  renderer.render(scene, camera);
  // 장면을 제거할 때 instances.dispose()
}
```

GPU에서 카운터 초기화 → frustum 판정 → atomic index 압축 → indirect argument 작성 → indirect draw 순서로 실행한다. 표시 수가 줄어든 만큼 실제 제출 인스턴스가 줄어든다. 기존 `createGpuCulledInstances`는 호환성 목적으로 유지하는 vertex 축소 방식이며, 제출 수를 줄이는 새 구현은 `createGpuDrivenInstances`다. 기존 building visibility readback 경로도 별개로 남아 있다.

현재 범위는 identity transform의 정적 translation 인스턴스와 하나의 material이다. geometry와 `drawRange`는 생성 시 복제·고정하며 indexed/non-indexed 및 빈 draw range를 지원한다. 반환 mesh나 그 부모에 이동·회전·scale을 적용하지 않는다. 동적 transforms, LOD, occlusion, animated skinning, 여러 material 그룹은 이 API가 처리하지 않는다.

GPU 미지원/구형 Three에서는 `null`을 반환하며 예제가 CPU 경로를 선택한다. Three r185의 storage attribute 수명은 내부 attribute manager에 격리해 연결했다. `BufferAttribute.dispose()` 이벤트만으로 storage가 해제되지 않는 버전이므로 **검증된 r185에서만** 새 GPU 경로를 활성화한다. geometry·material·compute kernel·storage 모두 소유하고 `dispose()`는 반복 호출해도 한 번만 해제한다. renderer와 입력 geometry는 호출자 소유다.

GPU 가시 개수는 `readVisibleCount()`로 비동기 조회할 수 있다. 예제에서는 0.75초 간격 telemetry로만 사용하며 렌더링은 readback을 기다리지 않는다. UI의 컬링 시간은 CPU 계산/제출 시간이고 GPU execution time은 포함하지 않는다.

공식 API: [IndirectStorageBufferAttribute](https://threejs.org/docs/pages/IndirectStorageBufferAttribute.html), [BufferGeometry.setIndirect](https://threejs.org/docs/pages/BufferGeometry.html#setIndirect), [Renderer.compute](https://threejs.org/docs/pages/Renderer.html#compute).

## 검증과 남은 범위

- `node scripts/probe-engine-showcase.cjs`: 실행 중인 5174 서버에 실제 Chrome으로 접속한다. native WebGPU와 CPU reference 가시 수 일치, indexed/non-indexed draw range, 빈 frustum, 반복 dispose와 storage 메모리 회수, 모드/밀도/카메라 전환, 공개 모듈 로드, 모바일 가로 넘침, WebGL2 fallback을 검사한다. `.tmp/engine-showcase/`에 JSON과 화면을 저장한다.
- `corepack pnpm run test:demo`: 임시 fresh build의 lazy graph, source map 경계와 CSS를 검사한다.
- `corepack pnpm run test:package:built`: 외부 ESM/CJS 및 타입 소비 경계. 새 두 함수도 공개 export 검사에 포함한다.
- 변경 관련 Jest, TypeScript, ESLint, library build와 publint를 별도로 실행한다.

전체 `verify:full`은 이 checkout에 없는 `.codex/hooks/astra-guard.test.mjs`에서 멈춘다. 전체 Jest에는 누락된 `manual-v1/catalog.json`, `ally_body.glb`, 의상/parts 파일, 삭제된 이전 World 예제 참조, 일부 renderer mock 및 Node 전용 asset test의 Jest 실행 문제가 남아 있다. 이전 예제 화면에 대한 소스 문자열 검사는 새 예제의 실제 브라우저 검증과 공개 import 계약으로 교체했다. 누락된 아트 자산이나 다른 도메인의 테스트를 이번 GPU 기능 성공으로 간주하지 않는다.

다음 단계는 scene mutation 기반 incremental mirror, GPU LOD/occlusion, 고정 시간 간격 simulation과 interpolation, asset streaming이다. 동적 entity 수명과 실제 gameplay 장면을 먼저 정한 뒤 각각 CPU/GPU 시간·업로드 바이트·재연결 수명으로 검증해야 한다. 이 문서는 해당 기능들의 구현 완료를 주장하지 않는다.
