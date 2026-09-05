# Renderer modernization

## Weather node projection (2026-09-05)

- WeatherEffect now chooses a lazy NodeWeather projection for WebGPURenderer. One instanced Sprite uses the existing CPU position array through weatherPosition; rain/snow/storm/wind simulation and camera following stay in the original component. The legacy Points projection remains for WebGLRenderer.
- WeatherNodeMaterial uses PointsNodeMaterial sizing with the existing color/size/opacity settings. Sprite geometry is cloned before attaching the shared array, and the clone/material are disposed on replacement/unmount. The source geometry/material remain owned by WeatherEffect. No per-particle component, additional simulation or per-frame array copy was introduced.
- Weather 11 tests pass using actual R3F reconciliation with substituted renderer marker/node material, covering instancing, CPU updates visible in the shared attribute, camera following, reuse and disposal. WGSL/GLSL generation passes perspective/orthographic weather plus the existing effects (16 conditions total). Build/root TypeScript, production ESLint, memory 88 tests and demo build pass; initial graph remains 7 chunks / 519148 JS bytes, admin 1592.
- Shader generation is not GPU execution. Actual particle size/color/fog comparison, native GPU resource behavior and main World renderer integration remain outstanding. Public props, persistent state and simulation formulas remain unchanged.

## Weather effect resource lifetime (2026-09-05)

- WeatherEffect previously recreated all particle resources when intensity changed despite not using intensity in particle generation, and did not dispose resources passed as object props. Real R3F tests failed for identity preservation and disposal before the fix.
- The store selector now reads only the effective weather kind (including a forced prop). Particle arrays, geometry and material persist while that kind and dimensions/count remain unchanged. Cleanup disposes owned geometry/material on replacement, clear weather and unmount. Weather store remains canonical; simulation formulas and public props are unchanged.
- Weather 9 tests, build TypeScript, production ESLint and existing memory suite 88 tests pass. The memory suite does not measure GPU allocations. No native GPU/FPS/browser comparison was performed. PointsMaterial size, WebGL postprocessing and remaining shaders still prevent claiming main-world WebGPU completion.

## GPU snow node path (2026-09-05)

- Camera-size follow-up: PointsNodeMaterial's default attenuation only applies to perspective cameras, whereas the existing GPU shader divides by view depth for both camera types. The node path now explicitly uses the same canvas pixel-height/depth formula and cancels the material's additional DPR factor. Both camera types generate WGSL 2708/1354 bytes and GLSL 2562/1531 bytes. All 12 builder conditions, Snow 8 tests, build TypeScript and production ESLint pass. Pixel-level browser comparison remains outstanding.

- `Snow gpu` now lazy-loads NodeGpuSnow for the WebGPURenderer marker and retains the existing GLSL Points implementation for WebGLRenderer. Main World Canvas and CpuSnow have not transitioned.
- Installed Three PointsNodeMaterial explicitly limits native WebGPU Points to one pixel; an instanced Sprite honors size attenuation. NodeGpuSnow uses one sprite with count 2000, owned cloned geometry, two static instance attributes (20 bytes/particle), and the existing fall/wrap/drift formulas. Time/origin updates reuse uniforms. No per-particle React subscriptions or CPU simulation are introduced.
- The Sprite's default shared geometry is cloned before attribute attachment; only the clone and its material are disposed. The default shared Sprite geometry is preserved.
- Snow 8 tests pass, including real R3F reconciliation with substituted node material/renderer marker: WebGL branch, instancing/count, camera following, rerender reuse and disposal. Memory 88 tests, build/root TypeScript, production ESLint and test:demo pass (7 initial chunks / 518882 JS bytes, admin 1592).
- Node builders pass both WGSL (vertex 2707 / fragment 1376 bytes) and GLSL (2566 / 1553), along with existing water/grass/flag cases. Shader generation is not native GPU execution. Actual visual comparison, orthographic/perspective size, native GPU resource cleanup and main-world renderer integration remain required.

## CPU snow allocation follow-up (2026-09-05)

- Current World still uses the default Canvas renderer, and GpuSnow still uses ShaderMaterial. These are remaining production migration boundaries; existing node-material tests do not prove main-world WebGPU completion.
- CpuSnow now memoizes position/velocity Float32Arrays instead of constructing discarded arrays as useRef arguments on every render. With 2000 particles, this removes 48000 bytes of typed-array backing storage per subsequent render. This is an allocation count, not an FPS measurement.
- Snow lifetime tests cover geometry/particle storage identity across followCamera changes, no simulation restart, late WASM resolution, allocation failure and memory growth. Six tests, build TypeScript and production ESLint pass.

## Grass TSL 연결 (2026-09-05)

- grassMaterial.ts에 기존 2D simplex, quaternion 회전, 바람, 밟힘, 군집/건조도, toon 단계, 색상과 alpha mask 수식을 옮겼다. GrassNodeMaterial의 uniforms.value 계약으로 기존 중앙 GrassManager apply 경로를 유지한다. per-blade React component/frame subscription과 새로운 instance upload 배열은 추가하지 않았다.
- Grass는 WebGPURenderer에서 NodeGrassMaterial을 lazy-load한다. Suspense가 GrassContent 전체를 감싸 초기화 이후 manager 등록과 bounds/instanceCount 설정이 이루어진다. 노드 재질은 texture 교체 시 다시 생성하며 사용자 색과 toon 값을 layout effect로 적용하고 제거 시 dispose한다. legacy renderer는 기존 GLSL을 유지한다.
- 실제 R3F reconciler+대체 node material로 두 renderer 분기, 중앙 manager의 visibility/instanceCount/time/wind/trample 적용과 unregister/dispose를 검증했다. grass 9 tests, 기존 memory suite 88 tests, build/examples 타입 검사, 변경 구현 ESLint, demo build 통과(7 초기 청크, 518373 JS bytes; 큰 Three/physics 청크 경고 유지).
- headless WGSL/GLSL builder 생성 통과: grass vertex 12454/10657 bytes, fragment 3310/3620 bytes. 실제 GPU의 색/노이즈/밟힘 비교와 native GPU 실행은 다음 검증이며 이 단계는 속도 향상을 실측한 것이 아니다. 공개 API와 canonical persistent state는 유지한다.

## Flag 브라우저 비교 (2026-09-05)

- probe-toon-water.cjs --flag와 fixtures/flag-compare.js를 추가/연결했다. 단일, 크기가 다른 2-instance batch, sRGB batch의 시간 0/3/12(9조건)를 실제 Chromium WebGL2에서 렌더링했다. alpha 0/0.5/1의 텍스처와 위치별 바람 위상을 포함한다.
- 최종 gaesup-flag-YoXKV1 결과: 전체 RGB 평균 오차 0.142~0.309/255, 배경 제외 평균 4.098~4.191/255, 시간별 이미지 변화 확인, 브라우저 오류 0. 같은 결과의 gaesup-flag-adwjrb/comparison.png를 시각적으로 확인했다. native adapter는 false였다.
- 최초 sRGB 비교는 업로드 후 texture.colorSpace를 변경해 backend별 텍스처 재할당 차이를 드러냈다. 실제 초기 로딩 계약을 검증하도록 각 색 공간의 텍스처를 업로드 전에 따로 생성했다. 런타임 colorSpace 변경 지원은 이 검증에 포함하지 않는다.
- 비교 runner에 foreground pixel 수와 foreground 오차 검증을 추가했다. 기존 수면 3조건도 재실행해 전체 1.035~1.138, foreground 1.345~1.476/255, 오류 0을 확인했다(gaesup-toon-water-ZMNY3v). 설치된 Three 파일을 직접 제공하는 격리 probe이며 실제 World Canvas native GPU 실행 검증은 남아 있다.
- 빌드 타입 검사와 test:package 통과. ESM/CJS/type 빌드, 소비자 타입 검사, import/require smoke와 Vite 소비 빌드에서 NodeFlagMaterial 1.25 kB, NodeWaterMaterial 1.78 kB, 공유 three.tsl 295.40 kB 청크로 분리됐다. 소비자 기본 4336.39 kB 청크 경고는 남아 있다.

## Flag TSL 연결 (2026-09-05)

- rendering/tsl/flag.ts의 FlagNodeMaterial에 기존 3중 파도/수직 ripple/처짐, 투명도와 alpha discard를 이관했다. time/windStrength accessor로 기존 단일·30Hz batch 갱신 경로를 유지한다. WebGPURenderer 표식에서만 NodeFlagMaterial을 lazy-load하며 WebGL은 기존 shaderMaterial을 유지한다.
- 기존 InstancedMesh를 보존하고 flagMotion vec2 속성에 위상과 높이 배율을 저장한다(인스턴스당 8 bytes). Three의 instance transform 이후 positionNode가 실행되므로 positionLocal을 기준으로 변위를 적용한다. Suspense를 batch 전체 바깥에 두어 재질 로딩 후 layout effect가 인스턴스 행렬을 초기화한다.
- 실제 R3F reconciler/대체 node material 테스트에서 단일 renderer 분기/시간 갱신, batch 위치/위상, 해제를 확인했다. Flag+BuildingSystem 33 tests, 기존 memory suite 88 tests, 빌드 타입 검사와 변경 구현 ESLint 통과.
- verify-toon-water-nodes.mjs를 확장해 단일/인스턴싱 Flag의 WGSL 및 GLSL 생성을 검증했다. headless builder는 feature 없음과 uniform buffer limit 65536을 사용하며 실제 GPU 기능/컴파일을 증명하지 않는다. 브라우저의 시각적 동등성, native GPU, 여러 크기의 batch 변형 비교는 다음 검증으로 남아 있다. 공개 API와 persistent source of truth는 유지한다.

## Ocean renderer 선택과 재진입 검증 (2026-09-05)

- Water.renderer.test.tsx에서 실제 R3F reconciler와 Ocean을 사용하고 renderer 표식/재질 factory만 대체해 분기와 ownership을 검사했다. legacy 경로는 ShaderMaterial을 유지하고 node factory를 호출하지 않으며, WebGPURenderer 표식은 lazy NodeWaterMaterial을 사용한다.
- 크기 변경 시 재질 재사용, 제거/재진입 시 이전 재질 dispose 1회와 새 재질 생성, suspended material 생성 중 제거 후 늦은 resolve가 재질을 생성하지 않는 것을 검증했다. 이는 실제 GPU 초기화나 네트워크 module-import 지연 검증은 아니다.
- 수면 관련 4 suites/7 tests와 examples 포함 타입 검사 통과. World Canvas 기본 renderer 전환과 전체 월드의 WebGPU shader 호환성 검증은 여전히 남아 있다.

## Toon water 화면 비교 (2026-09-05)

- 기존 ShaderMaterial과 TSL을 같은 320x320 camera/geometry, 시간 0/3/12에서 실제 Chromium WebGL2로 렌더링했다. 최초 비교에서 평균 RGB 차이 약 48/255를 확인해, legacy shader의 display-value 출력을 보존하도록 TSL 최종 색에 sRGBTransferEOTF를 적용했다.
- 수정 후 평균 채널 차이 1.035/1.069/1.138, 애니메이션 변화와 브라우저 오류 0 확인. scripts/probe-toon-water.cjs는 3/255 오차 상한을 검사하고 스크린샷/결과를 TEMP에 남긴다. 최종 결과 gaesup-toon-water-W2DXX3, 동일 출력의 직전 비교 이미지 gaesup-toon-water-jh1ZnN/comparison.png를 시각적으로 확인했다.
- 기존 Vite 서버 PID 6980은 유지했다. Outdated Optimize Dep 오류를 피하려고 probe가 설치된 Three build와 현재 source를 직접 제공한다. 실제 앱의 Vite module loading 검증을 대신하지 않는다.
- native adapter 조회는 false였다. 실제 WGSL GPU 실행은 미검증이다. WGSL/GLSL 생성 검증에서는 backend와 builder가 일치하도록 forceWebGL 설정을 수정했다. 빌드 타입 검사와 수면 테스트 4개 통과.

## Toon water TSL 경로 (2026-09-05)

- 기존 GLSL의 3중 파도 변위, 4-octave value noise, 깊이 색상, 거품과 경계 계산을 rendering/tsl/toonWater.ts의 MeshBasicNodeMaterial 그래프로 옮겼다. Ocean은 isWebGPURenderer에서만 NodeWaterMaterial을 lazy-load하며 기존 WebGLRenderer는 GLSL 재질을 유지한다. WebGPURenderer의 WebGL2 fallback도 node 경로를 사용한다.
- 새 재질은 frame elapsed uniform을 갱신하고 컴포넌트 제거 시 해제한다. 공개 API, 기본 World Canvas renderer, 저장 계약과 main dependency 버전은 유지한다.
- verify-toon-water-nodes.mjs가 설치된 Three의 실제 WGSL/GLSL node builder로 vertex/fragment shader를 생성한다. GPU 컴파일/그림 비교 검증은 아니며 출력 색 공간, 거품/파도 외관과 native GPU 검증은 아직 필요하다. 반사 Water 경로는 여전히 WebGL compatibility 경로다.
- 빌드 타입 검사, 변경 구현 ESLint, 수면/재질 테스트 4개, 기존 memory suite 88개, demo build/chunk 검사 통과. demo 최초 정적 의존성은 7개 청크 518240 JS bytes이며 큰 Three/physics 청크 경고는 남아 있다.
- test:package 통과: ESM/CJS/type 빌드, 소비자 타입 검사, import/require smoke와 소비자 Vite build. 소비자 NodeWaterMaterial은 별도 296.84 kB 청크로 출력됐으며 기본 청크 4335.57 kB 경고는 남아 있다.

## 반사 수면 자원 소유권 (2026-09-05)

- Ocean의 Water 등록을 내부 OwnedWater로 연결했다. R3F 객체 제거/재생성 시 dispose가 반사 텍스처의 renderTarget과 재질을 해제한다. 공유 노멀 텍스처와 외부 geometry는 해제하지 않는다.
- geometry, fallback material, toon material의 effect cleanup을 각 자원의 의존성으로 분리했다. 크기 변경이 유지 중인 toon material을 dispose하던 경로를 제거했다.
- 설치된 Three 0.185.1과 실제 R3F test renderer에서 반사 수면 크기 변경/제거 및 toon 재질 유지 검증 2개, 노멀 공유 검증 1개 통과. 빌드 타입 검사, 변경 구현 ESLint, 기존 memory suite 88개 통과.
- 이 검증은 dispose 호출과 ownership을 확인한다. 실제 GPU 메모리 측정, 이전 Three peer 버전의 texture.renderTarget 지원, native WebGPU 수면/TSL 이관은 아직 검증되지 않았다. 공개 API와 persistent source of truth는 변경하지 않았다.

## 목표와 범위

- GPU 컬링 카메라 유효성: culling store의 결과에 선택적 camera(viewProjection, position, coordinateSystem, reversedDepth) 정보를 추가한다. 기존 setResult 호출은 유지하며 카메라 정보 없는 결과는 CPU visibility 후보 제한에 사용하지 않는다. 계산 요청 당시 정보를 결과와 함께 전달하고 현재 카메라와 일치할 때만 GPU 후보를 사용한다. persistent state와 snapshot 버전 계약은 유지한다. 카메라 회전/투영 변경 후 늦게 도착한 결과, 동일 후보의 카메라 정보 갱신, 기존 공개 API 및 건축 테스트를 검증한다.

- 후속 컬링 slice: 공개 extractFrustumPlanes에 선택적 clipDepthZeroToOne 인자(기본 false)를 추가하여 WebGPU의 0..1 깊이 범위를 지원한다. 기존 두 인자 호출은 WebGL -1..1 동작을 유지하며 engine-neutral typed-array 계약을 보존한다. 성능 예제의 CPU/GPU 호출은 카메라 coordinateSystem/reversedDepth에서 이를 결정한다. 실제 Three projection을 이용한 near/far 판정과 public API/package exports, next 및 성능 예제 회귀 검사로 검증한다.

- 예제까지 포함한 isolated alpha 타입 검사에서 world/scene.tsx의 Drei Grid root import 1건을 확인했다. 기존 legacyDrei boundary의 Grid를 공개 root의 LegacyGrid로 제공하여 예제도 같은 호환 경로를 사용한다. 새 subpath는 만들지 않으며 package exports/alias/entry/paths/type-copy 계약은 유지한다. 기존 격자 props와 renderer 동작을 보존한다. 공개 API/패키지 검사 및 stable/alpha example 타입 검증으로 확인한다.

- 렌더러/React 통합 boundary를 최신 Three 및 R3F API로 이관한다. 기존 typed-array simulation과 canonical SceneDocument는 유지한다.
- 1단계: React 19.2.8, Three 0.185.1 및 대응 타입, R3F 9.7.0, Drei 10.7.8, Rapier 2.2.0, postprocessing 3.1.1 조합으로 기존 경로를 검증한다. 이는 R3F 10 alpha 이관을 위한 중간 단계다.
- 2단계: R3F 10.0.0-alpha.4, Drei 11 alpha와 Rapier peer/API 계약을 실제 코드 및 브라우저로 검증하고 renderer 및 scheduler 경계를 이관한다. WebGL 전용 효과는 명시적인 compatibility 경로로 남긴다.
- Source of truth: package.json/lockfile이 검증된 실행 조합을 정의하며, renderer factory는 기존 src/core/rendering 및 src/next/backend가 소유한다. dependency 업데이트로 persistent schema를 바꾸지 않는다.
- public peer 범위에 새 검증 버전을 추가한다. 기존 버전 지원을 유지하려면 호환 테스트로 증명하고, 실제 지원 불가능한 범위는 명시적으로 수정한다.
- 제외: 이 slice에서 Vite/TypeScript의 major 업그레이드, asset authoring과 multiplayer protocol 재설계는 섞지 않는다. 전체 modernization 목표에는 후속 작업으로 남긴다.
- 리스크: Three shader chunk/TSL 변경, geometry/material 타입, WebGPU dispose/animation-loop 반환값, R3F scheduler와 Rapier useFrame timing, third-party React peer.

## 검증

- 물 효과 조사: rendering/tsl/water.ts는 CPU displacement/LOD 유틸리티이며 실제 TSL NodeMaterial이 아니다. Ocean의 toon ShaderMaterial과 three-stdlib Water 모두 WebGL 호환 경로로 남아 있어 별도 shader 이관이 필요하다. 기본 toon 물에서 사용하지 않는 128x128 procedural normal texture 계산을 생략하도록 수정했다. 반사 물로 바꿀 때 1회 생성하고 여러 반사 물이 공유하는 테스트 통과. build 타입·production ESLint와 메모리 스위트 88 tests 통과. shader 외관이나 native GPU는 이번에 검증하지 않았다.

- 늦은 readback rejection 회귀 검증 완료: mapAsync가 시작된 뒤 unmount·snapshot 변경·buffer 교체를 수행하고 이후 rejection을 전달한다. 새 결과 identity 보존, 이전 버퍼 정확히 1회 해제, 이전 mapped range 미접근을 확인했다. buffer 교체에서는 같은 device의 새 readback이 정상 완료되어 version 2를 게시하는 것도 검증했다. 관련 가시성 26 tests와 build 타입 검사 통과. 이전 단락의 늦은 실패 회귀 테스트 미완료 항목을 해소한다. native GPU 검증과 main renderer 전환은 여전히 별도 미완료다.

- GPU readback 실패 복구: mapAsync 호출을 Promise 경계 안에서 수행해 동기 throw와 비동기 rejection을 함께 처리한다. 현재 자원의 읽기 실패 시 소유 버퍼 해제·busy 해제·실패 device 반복 억제를 수행한다. 교체된 자원의 늦은 오류는 무시하며 다른 snapshot의 결과는 reset하지 않는다. mapAsync 동기/비동기 실패와 getMappedRange 실패의 cleanup/재시도 억제 테스트를 포함한 가시성 23 tests, 메모리 스위트 88 tests, build 타입·production ESLint 통과. 늦은 실패의 별도 회귀 테스트와 native GPU validation scope 검증은 남아 있다.

- 정지 장면 GPU 컬링 재사용: 이전 결과의 snapshot version, 카메라 world position, view-projection, coordinateSystem과 reversedDepth가 모두 같은 경우 uniform 작성·전송·compute·readback을 건너뛴다. 기존 결과 store와 scratch 객체를 재사용하며 새로운 프레임별 캐시 객체는 만들지 않는다. mock device에서 200ms 간격 21회 호출 중 전송/readback 각 1회, 이동·FOV 변경·snapshot 갱신 후 각 1회 추가 계산을 확인했다. 관련 GPU/CPU 가시성 20 tests, build 타입·production ESLint 통과. 실제 GPU 시간/FPS 측정은 미실행이며 main WebGL Canvas 전환을 의미하지 않는다.

- GPU 컬링 제출 실패: uniform write, encoder 생성, 명령 제출의 동기 예외를 처리한다. 소유 버퍼를 해제하고 GPU 가시성 결과를 초기화하며 같은 실패 device의 반복 제출을 억제한다. 세 실패 지점에서 프레임 예외 없음·버퍼 각 1회 해제·CPU fallback 상태를 검증했다. 관련 GPU/CPU 가시성 19 tests 및 build 타입·production ESLint 통과. 이 검사는 mock device를 사용하며 비동기 WebGPU validation error나 native GPU 실행을 검증하지 않는다. main Canvas는 여전히 기본 WebGL이며 전환 완료가 아니다.

- 빌드/root 타입 검사, rendering/next/motions/character/scene 관련 테스트, publicApi/packageExports.
- 전체 Jest, package consumer, demo build 및 실제 CPU/GPU·물리 브라우저 시나리오.
- 실제 frame interval과 heap/리소스 전후 비교를 기록하며 헤드리스 절대 FPS를 하드웨어 성능 주장으로 사용하지 않는다.
- 실행 중인 5173 dev server는 재시작/종료하지 않고 재사용한다.

### 정지 카메라 컬링 캐시 수정

- CPU 성능 패널에 `카메라 자동 회전` 체크박스를 추가했다. 기본 회전은 유지하고 정지 상태를 직접 확인할 수 있다. 토글은 OrbitControls prop만 변경하며 scene mesh와 컬링 캐시/업로드 버전을 보존하는 테스트를 추가했다. 관련 20 tests와 build/root 타입·lint 통과. 실제 브라우저 회전 정지 실측은 아직 하지 않았다.

- CPU 성능 예제의 previousViewProjection은 Float32였지만 Three.Matrix4.elements의 number와 직접 비교했다. 소수 행렬에서 정지한 카메라 120프레임 모두 변경으로 판정되는 회귀를 재현했다.
- 비교용 캐시만 Float64Array(16)으로 바꿨다. GPU 전달용 행렬과 typed-array 컬링 경로는 Float32를 유지한다. 고정 메모리 64바이트 증가로 매 프레임 컬링/행렬 재작성/업로드 요청을 피하며 새 프레임 할당은 없다.
- 실제 Three 카메라·컬링·InstancedBufferAttribute와 모의 프레임 호출로 120회 중 컬링 1회, attribute version 증가 1회를 확인했다. 카메라 이동 후 각각 2회로 증가한다. 이는 실제 GPU 전송량/FPS 실측이 아니다.
- 관련 CPU/GPU lifetime 20 tests, build/root TypeScript 및 production ESLint 통과. 테스트 최초 fixture는 DOM mesh에 instanceMatrix가 없어 실패했고 이를 제공한 후 수정 전 120회 실행을 재현했다. native GPU와 main R3F10 전환은 계속 미완료다.

## 완료 조건

- 실제 compute gate 추가: scripts/probe-building-gpu-culling.cjs가 현재 BuildingGpuCullingDriver의 WGSL을 직접 추출하여 독립 localhost 페이지의 WebGPU에서 compilation info, layout:auto 바인딩 [0,2,3], 구체5개의 compute/readback 및 validation scope를 검사한다. Three의 WebGPU projection으로 기대값 [0,1,1,0,0]을 구성하며 모든 소유 buffer/device/browser/server를 정리한다. Node syntax 통과. 현재 환경의 기본 Chromium 및 --software(--enable-unsafe-webgpu, --use-angle=swiftshader) 양쪽 requestAdapter가 null로 종료1: 컴파일·바인딩·compute는 아직 실행되지 않았으며 성공 증거가 없다. 기존 개발 서버는 사용하거나 변경하지 않았다. 어댑터가 있는 환경에서 이 gate 및 전체 월드 native WebGPU 검증이 필요하다.

- 컬링 후속 패키지 검증: 현재 소스의 `corepack pnpm test:package` 종료0, ESM/CJS/타입 빌드 및 임시 consumer 설치·타입 검사·runtime import/require·Vite build 통과. `corepack pnpm test:demo` 종료0, TEMP/gaesup-world-demo-GXtbQZ. 초기 static closure 7 chunks / 515746 JS bytes, 관리자 UI1592 bytes 지연 로딩 확인. 기존 큰 청크 경고는 남아 있다. 이는 WGSL compile/compute 실행이나 하드웨어 성능 증거가 아니다.
- GPU 컬링 미사용 바인딩 수정: main에서 읽지 않는 meta(binding1)를 WGSL과 bind group에서 제거했다. ComputeResources와 생성 함수의 metaBuffer 의존성도 제거하여 메타데이터 버퍼 없이 실행하고 해당 버퍼 교체만으로 컬링 자원을 재생성하지 않는다. mock device 통합 테스트는 metaBuffer=null에서 uniform 전송 및 bindings [0,2,3]을 확인한다. building 31 suites / 296 tests 통과(기존1skip), build 타입·변경 ESLint 통과. 실제 WGSL validation/compute 실행 검증은 여전히 남아 있다.

- 실제 설치 조합 후속 검증: `probe-r3f10-rapier.cjs --installed-rapier`를 workspace Fiber9.7과 TEMP/gaesup-r3f10-install-6hXYUp의 patched Fiber10alpha에서 실행했다. resolver override 없이 두 조합 모두 300프레임 낙하·충돌·pause/resume·body 제거 통과, 착지 y=0.49872368574142456 및 재개 y=0.4366498291492462 동일. 첫 scheduler delta 차이로 누적 delta는 각각 5.0/4.9833초이며 완전한 timing 동등성 주장은 하지 않는다. renderer는 stub이고 callbackRefCleared=false 양쪽 동일; 전체 GPU cleanup 증거가 아니다. Rapier의 선언된 Fiber9 peer 범위 문제는 남아 있다.
- 같은 실제 patched 설치를 사용한 현재 전체 예제 빌드 TEMP/gaesup-r3f10-demo-RI6CkM은 통과했다. Fiber source-map provenance는 실제 pnpm patch 경로이며 virtual inactive-root guard는 사용하지 않는다. Drei legacy boundary 및 World 관측 hook은 여전히 가상 변환이다. 최신 단일 payload visibility cache도 이 빌드에 포함됐다.
- 위 빌드의 새 Chromium 월드→도구→에셋→월드 검증 종료0. TEMP/gaesup-r3f10-world-Y2GCmw/result.json에서 page/console/lifecycle/request 오류0, scenes.json에서 root_0(frame250)→root_1(frame32), geometry 객체132→132 및 이름/종류/정점수 집계 차이0 확인. world-return.png를 열어 바닥·나무·불 재표시 확인. isLegacy=true이므로 native WebGPU 및 모든 효과/GPU 자원 회수 검증은 아니다. 기존 5173 PID6980 유지. 메인 package/lockfile과 persistent source of truth는 이번 검증에서 변경하지 않았다.

- `/legacy` ESM import 실패 후속: `prepare-r3f10-install.cjs --repair-legacy-imports`가 legacy ESM의 three root에서 MeshBasicNodeMaterial/Node/NodeUpdateType을 제거하고, 실제 사용처인 occlusion의 loadTSL에서 three/webgpu와 함께 동적으로 로드하도록 ESM/CJS 양쪽을 패치한다. createOcclusionObserverNode에는 필요한 생성자/상수를 전달한다. static GPU import나 dummy class로 기능을 대체하지 않는다. TEMP/gaesup-r3f10-install-6hXYUp에서 pnpm patch 설치 종료0, verify-r3f10-install의 6개 실제 진입점 import 및 inactive/active 분기 검사 모두 통과. 생성 스크립트 syntax 통과. 로그 TEMP/gaesup-r3f10-legacy-install.log.
- 동적 코드 확인: 설치된 legacy.mjs에서 occlusion 함수 블록을 추출해 모의 store와 실제 Three 클래스로 실행했다. 실제 dynamic import 후 MeshBasicNodeMaterial/Node 생성, helper 제거, geometry/material 각 1회 dispose 통과. 초기 전체 소스 복사 방식은 pnpm의 전이 의존성 해석 위치 때문에 react-use-measure를 찾지 못해 실패했고 함수 블록 단독 검사로 범위를 명시했다. 이 검사는 GPU/device를 사용하지 않으며 actual occlusion 결과나 CJS occlusion 전체 실행, 최신 패치로 browser 재검증까지 증명하지 않는다. production package/lockfile 및 상태 계약은 유지하고 Rapier peer 경고와 native WebGPU 전환은 계속 남아 있다.

- pnpm 실제 패치 설치 검증: `scripts/prepare-r3f10-install.cjs`가 감사한 alpha.4의 root/legacy/webgpu × ESM/CJS 6개 배포 파일에 inactive invalidate guard를 넣는 unified patch와 격리 package.json을 생성한다. TEMP/gaesup-r3f10-install-VCG9O0에서 pnpm install 종료0, 패치 hash가 포함된 설치 파일로 전체 demo build 종료0, alpha 전체 937 files 타입 진단0. build probe는 pnpm symlink의 실제 경로를 따라 소스맵 provenance를 검사한다. 출력 TEMP/gaesup-r3f10-demo-7UbXiL은 guardInactiveRoots=false로 가상 guard 없이 실제 설치 패치를 사용한다. legacyDrei의 가상 /legacy export 경계는 여전히 남아 있다.
- `scripts/verify-r3f10-install.cjs`는 실제 6개 모듈 import 후 inactive root는 skip, active unknown root는 기존 scheduler 경고를 유지하는지 검사한다. 5개 통과, Fiber `/legacy` ESM 1개 실패: alpha legacy.mjs가 three root에 없는 MeshBasicNodeMaterial/Node/NodeUpdateType을 import한다. 따라서 전체 패키지 계약 검증은 실패 상태다. Rapier2.2.0의 Fiber^9.0.4 peer 경고도 install 로그에 남아 있으며 override로 숨기지 않았다. 설치 로그 TEMP/gaesup-r3f10-install.log, build 로그 TEMP/gaesup-r3f10-installed-build.log. 3개 스크립트 syntax 통과. main package/lockfile/설치와 public API 변경 없음. 이 단계는 실제 pnpm patch 재현성 증거이며 소비자 peer에 패치가 자동 전파된다는 뜻이 아니다. production 적용 전 peer/entrypoint 계약과 남은 WebGPU 통합을 해결해야 한다.

- 가시성 캐시 후속 단순화: 행렬 변경 시 전체 무효화되므로 기존 96-entry Map/방향 bucket 문자열/방향 scratch를 마지막 payload 한 개로 교체했다. 정지 카메라는 frustum 재구성과 후보 수집 전에 기존 결과를 재사용한다. snapshot 버전 또는 GPU 후보 집합 변경도 캐시를 무효화한다. 실제 Three Frustum을 사용한 테스트에서 동일 카메라의 판정 주기 120회 중 intersectsSphere 1회, 시야각 변경 후 누적 2회, 이후 120회에서 추가 호출0을 확인했다. 같은 GPU 버전의 후보 집합 변경에도 표시/숨김이 갱신된다. production 타입·ESLint 및 건축 284 tests 통과(기존 1 skip), 추가 GPU 후보 assertion은 해당 테스트를 재실행해 통과했다. 실제 FPS/메모리 절감 측정은 아니며 이 단순화 후 browser는 아직 재실행하지 않았다. persistent 및 public 계약 유지.

- 재진입 누락 수정 (2026-09-05): `BuildingVisibilityDriver`가 이전 matrixWorldInverse로 frustum을 계산하고 위치 X/Z·방향 bucket만으로 결과를 캐시했다. 카메라의 최신 world matrix를 먼저 갱신하고 world position을 사용하며, view-projection 행렬이 변하면 결과 캐시를 비운다. scratch Matrix4 한 개를 추가하고 기존 공간 index·typed-array·정지 카메라의 결과 재사용은 유지한다. 시야각 변화/높이 변화/정지 상태 재사용 회귀 테스트 통과. 건축 30 suites 284 tests 통과, 기존 1 suite/test skip; build 타입·변경 production ESLint 통과. 공개 API 및 persistent source of truth 변경 없음.
- 실제 alpha WebGL 비교: 관측 빌드의 onCreated snapshot은 오래된 internal 객체를 참조할 수 있어 현재 상태를 get()으로 읽도록 probe를 수정했다. 초기 132→재진입111 객체 및 모래 바닥·효과 누락을 재현했고(산출물 TEMP/gaesup-r3f10-world-Cr4lI6), production visibility 수정 후 132→132, 이름/종류/정점 수 집계 차이0으로 복구됐다. 새 root_1의 실제 프레임31 실행 후 캡처에서 바닥·나무·불을 직접 확인했다. 산출물 TEMP/gaesup-r3f10-world-eIoGXd, 로그 TEMP/gaesup-r3f10-visibility-browser.log, build TEMP/gaesup-r3f10-demo-edywrB. page/console/lifecycle/request 오류0. 앞선 snapshot 기반 132→132 결과는 stale state여서 재진입 증거에서 제외한다. root 교체와 최소 render frame 대기를 probe에 추가했다. --inspect-world 및 --guard-inactive-roots는 격리 빌드에만 적용되며 production R3F10 설치와 native WebGPU는 아직 미완료다.

- 재진입 이미지의 추가 미해결 관찰: world-return.png에서는 최초 화면에 보였던 일부 바닥/효과 오브젝트가 보이지 않는다. 장면 변화인지 공유 리소스 해제 문제인지 아직 구분하지 못했으므로 경고가 사라진 결과만으로 재진입 시각적 동등성까지 통과로 간주하지 않는다. 후속 비교는 동일 카메라·시뮬레이션 상태에서 객체/geometry/material 소유권을 확인해야 한다.

- 실제 전체 월드 alpha browser gate (2026-09-05): 현재 소스로 격리 빌드(TEMP/gaesup-r3f10-demo-2V3NGO)를 만들고 `scripts/probe-r3f10-world.cjs`의 임시 preview에서 월드 조명·캐릭터·장면을 표시했다. GLB는 기존 5173 서버에서 proxy로 읽었다. 최초 진입은 page/console/request 오류0이지만 월드 도구 열기→에셋 이동→월드 재진입에서 `[Scheduler] Root "root_0" not found; invalidation ignored.`가 발생해 gate는 실패했다. 원래 로그 TEMP/gaesup-r3f10-world-lifecycle.log. 소스맵 추적: Fiber index.mjs 14624 events.disconnect → 13507 store set → 1066 store subscriber → invalidate. root unregister 이후 지연 event cleanup이 다시 갱신을 요청한다.
- `probe-r3f10-demo.cjs --guard-inactive-roots`는 격리 빌드에서만 실제 alpha invalidate의 비활성 state 갱신을 차단한다. 설치된 node_modules 및 production dependency는 수정하지 않는다. 동일 browser gate가 종료0, page/console/request/lifecycle 오류0으로 통과했고 재진입 캡처를 직접 확인했다. guarded build TEMP/gaesup-r3f10-demo-xIRxVR, browser 산출물 TEMP/gaesup-r3f10-world-UvxoJI, 로그 TEMP/gaesup-r3f10-world-guard-browser.log. 두 스크립트 Node syntax 통과. 이것은 기본 WebGL Canvas의 전체 월드 표시/도구/route 수명 검증이며 native WebGPU, 이동·물리 정확성, 모든 효과, production 설치/patch 정책과 GPU 자원 회수의 완료 증거가 아니다. 다음 slice는 이 upstream 수명 수정의 채택 방식 및 실제 WebGPU Canvas 통합이다.

- [x] 최신 React/Three 통합과 package consumer가 통과한다.
- [ ] R3F 10/WebGPU·WebGL compatibility 및 Rapier 실행 경계를 검증한다.
- [ ] 프레임/리소스 회귀를 측정하고 코드 수정 및 검증 결과를 HARNESS.md에 기록한다.

### Failed renderer factory gate

- 후속 configure 실패 검증: scripts/probe-r3f10-configure-failure.cjs를 실제 격리 Fiber 10.0.0-alpha.4에서 실행했다. 초기화된 모의 renderer의 setSize가 실패하면 원래 오류가 전달되고 root 등록은 남는다. 이후 명시적 root.unmount는 root를 제거하지만 renderer.dispose는 호출하지 않는다. 소유자가 dispose를 호출해 1회 해제되는 것을 확인했으며 경고는 없었다. 실제 GPU가 아닌 초기화 이후 프레임워크 수명 검증이다.
- browser-probe.mjs의 현재 release는 configured Promise가 reject되고 root가 존재하면 바로 throw하므로 위 정리를 건너뛴다. 다음 수정은 실패 후에도 생성된 root와 renderer를 정리하는 경로이며, scene 생성 전 실패와 null scene unmount 문제까지 분리해서 검증해야 한다. 이번 probe만으로 prototype의 모든 configure 실패나 메인 Canvas 전환을 완료 처리하지 않는다. 메인 월드는 examples/pages/World.tsx의 기본 Fiber Canvas이고 createRenderer가 연결되어 있지 않다.

- Next backend에도 초기 backend ownership 정리를 적용했다. init 실패는 서로 다른 초기·현재 backend를 각각 best-effort dispose하고 기존 null 반환을 유지한다. 성공한 내부 fallback은 버려진 초기 backend만 해제한다. 실패한 Renderer.dispose는 호출하지 않는다. partial WebGL cleanup 예외는 이 facade의 기존 실패 계약에 따라 삼키며 완전한 자원 회수 보장은 아니다.
- next/GPU lifetime 8 suites / 75 tests 및 build/root 타입·production ESLint 통과. probe-renderer-factory-failure.mjs --next가 실제 설치된 Three backend와 production facade에서 모의 device 1개 생성·1개 해제 및 null 반환을 확인했다. physical GPU/browser 검증은 아니다. GPU 라이브러리는 이미 dynamic import였으므로 초기 로딩 개선이라는 주장은 하지 않는다.

- Added `probe-renderer-factory-failure.mjs`: loads production createRenderer through Vite SSR with actual Three WebGPURenderer/backend classes. A simulated device is allocated, then actual WebGPUBackend setup is forced to fail; WebGL context creation also rejects. The production factory destroys the simulated owned device exactly once, preserves the fallback error identity, and logs the uninitialized WebGL cleanup failure. Probe and syntax check pass. No browser, physical device or native GPU is used by this integration check.
- Post-change package consumer and demo verification pass (TEMP/gaesup-backend-package.log and gaesup-backend-demo.log). Existing >500kB chunk warnings remain; administrator UI 1597 JS bytes is still deferred from initial imports. Full Jest was not repeated for this probe-only follow-up.

- Production createRenderer now captures the original backend. On init rejection it attempts each distinct original/current backend disposal, logs cleanup errors independently and rethrows the original init error. On successful automatic backend replacement it releases the abandoned original backend. It does not call Renderer.dispose after failed init, which would re-await the rejected promise.
- Real Three backend method probe confirms WebGPU disposal tolerates pre-init state and destroys internally owned devices while preserving supplied devices; device objects in this check are stubs. Pre-init WebGLBackend.dispose throws because extensions is null, so cleanup remains best-effort with logged errors rather than a universal GPU cleanup guarantee.
- Factory 16 tests, build/root TypeScript and implementation ESLint pass. Tests cover distinct fallback backends, cleanup failure isolation/original error identity, successful fallback releasing only the abandoned backend, and existing disposal compatibility. Three's declaration omits Backend.dispose, so the implementation checks the runtime method without any casts. Public API/persistent contracts unchanged. Actual device failure cleanup and browser integration after this production edit remain pending.

- Actual installed Three185 common Renderer probe (`scripts/probe-three-init-disposal.mjs`) confirms the partial-initialization disposal gap using a Backend subclass that records allocation then rejects init. Renderer.dispose skips backend.dispose because initialized is false, then setAnimationLoop awaits the cached rejected init promise and produces an unhandled rejection. The probe captures that exact error and explicitly frees its simulated backend allocation afterward. This is real Renderer lifecycle code with simulated allocation, not a real GPU leak measurement.
- Therefore adding renderer.dispose in the factory catch is not sufficient. A production fix requires explicit backend/device ownership and failure cleanup, including the original WebGPU backend when automatic fallback replaces it. Do not mark failed-init cleanup complete based on the earlier pre-constructor rejection test. Syntax and actual Node probe pass; production code remains unchanged.

- Browser OwnedCanvas now awaits renderer initialization before createRoot/configure. Cancellation before root allocation skips registration and releases the initialized renderer; rejected initialization removes the canvas and disconnects its resize observer without attempting root teardown.
- Actual StrictMode browser validation passed: normal 3 cycles allocate only 3 roots while creating/disposing 6 renderers; context updates, resize, pointer, Rapier pause/resume/remove remain valid, final resource counters zero. Delayed initialization cancellation creates 0 roots and disposes both initialized renderers with 0 frames. Injected pre-constructor failure creates 0 renderers/roots, removes the canvas and preserves the original error, with no cleanup error.
- Log TEMP/gaesup-r3f10-preinit-browser.log, artifacts TEMP/gaesup-r3f10-browser-oAZUE0. Probe/fixture syntax passed. WebGL2 fallback only; actual partial Three initialization failure and errors inside configure after root allocation remain unverified/unhandled gates. No production dependency/public API/persistent state changes.

- New actual Fiber10 alpha Node probe `probe-r3f10-init-failure.cjs <fixture> --require-cleanup` fails: renderer factory rejection propagates, but root.unmount later attempts to dispose a null scene and leaves `_roots` registered. This is distinct from successful delayed initialization cancellation. No GPU resources were allocated in this injected failure probe.
- `--initialize-before-root` comparison passes: awaiting the same rejected renderer initialization before calling createRoot preserves the original error and never registers a root. This establishes the root-allocation ordering requirement; it does not validate disposal of a partially initialized real Three renderer or fix configure failures after initialization succeeds.
- Syntax check passes. Production and browser fixture ownership have not yet adopted this ordering. Next implementation must initialize the owned renderer before root registration, dispose a successful renderer if cancellation occurs before registration, and retain the already-verified context/StrictMode/event cleanup paths. The partially initialized Three renderer failure remains a separate open gate.

### Parent context bridge validation

- The isolated OwnedCanvas now uses Fiber's exported useBridge under its-fine FiberProvider, matching the installed Canvas context boundary. The browser fixture passes a parent React context into the scene and updates it via a DOM control; the scene observes initial -> updated without creating another renderer. Remounted scenes retain the updated context.
- Actual StrictMode browser run passed context propagation, resize/pointer, three physics/pause/remove cycles (6 created / 6 disposed, final renderer resource counters zero), and pending initialization cancellation (2 created / 2 disposed, zero frames). No page/console errors or stale scheduler invalidation warnings. TEMP/gaesup-r3f10-context-browser.log; artifacts TEMP/gaesup-r3f10-browser-engSZe.
- Both edited scripts passed syntax checks. Main package/lockfile, public API and persistent state are unchanged. This is a generic React context bridge proof in the isolated WebGL2 fallback fixture; production RuntimeProvider integration, failed renderer initialization, native WebGPU and full Canvas prop parity remain open.

### Scheduler teardown ordering investigation

- Browser follow-up: draining children alone did not remove the warning. --trace-invalidation traced the remaining call to the event manager's disconnect -> store set -> scheduler invalidate after unregisterRoot. OwnedCanvas now disconnects events after child cleanup and before root unmount; the later framework disconnect is a no-op because no target remains connected.
- Actual StrictMode browser probe then passed resize/pointer, three physics/pause/removal cycles (6 renderers created / 6 disposed, final resource counters zero), and delayed initialization cancellation (2 created / 2 disposed, zero frames). The probe now fails on stale-root invalidation warnings as well as page/console errors; none occurred in the successful run. Log TEMP/gaesup-r3f10-disconnect-browser.log, artifacts TEMP/gaesup-r3f10-browser-fjFqww.
- Backend was WebGL2 fallback, so native WebGPU remains unverified. This closes the prototype's observed teardown warning, not production integration/context parity or failed initialization. Main dependencies, public API and persistent state are unchanged. Browser script and fixture syntax checks passed.

- Actual isolated Fiber10 alpha Node probe with --defer-unmount --verify-cleanup-invalidation reproduced one stale-root invalidation warning from a plain React passive cleanup, independently of Rapier. Root removal and renderer disposal still completed.
- Added --drain-children: React.act(root.render(null)) runs child cleanup while the scheduler root remains registered. The same probe then reports zero stale invalidation warnings, root removal and exactly one renderer disposal. This is an ordering proof using React.act and a stub renderer, not a browser/native GPU result.
- Browser OwnedCanvas prototype now renders a cleanup completion component and waits for its passive effect before unregistering the root. Cancelled initialization without a rendered store skips this drain. Syntax checks pass; browser StrictMode/cancellation verification of this new ordering is still pending. Main production dependencies and renderer code are unchanged.
- Latest main full Jest checkpoint: 252 suites / 2184 tests passed, 1 suite/test skipped, 52.013s. TEMP/gaesup-current-full.log. This includes recent preview/gamepad production changes, not proof of the isolated browser prototype.

## 근거

- 2026-09-05 registry dist-tags와 peerDependencies 확인.
- https://github.com/pmndrs/react-three-fiber/releases/tag/v10.0.0-alpha.4
- https://github.com/mrdoob/three.js/wiki/Migration-Guide

## 2026-09-05 검증 기록

- 예제 전체 alpha 번들 gate: `scripts/probe-r3f10-demo.cjs <fixture>`로 실제 App을 임시 output에 빌드했다. React19.2.8/Three185.1/Fiber10.0.0-alpha.4/Drei11.0.0-alpha.6을 alias하고 legacyDrei 파일만 /legacy로 대체한다. exit0, Node syntax 통과. 소스맵에서 Fiber 구현은 fixture index.mjs 하나이며 React/ReactDOM/Drei도 fixture 설치본만 포함되는 것을 검사한다. workspace Rapier/postprocessing은 유지한다. 로그 TEMP/gaesup-r3f10-demo-verified.log, 산출물 TEMP/gaesup-r3f10-demo-P8s9O9. 기존 chunk 크기 경고가 남고 실제 App browser 실행과 native GPU는 아직 미검증이다. main package/lockfile/dev server는 변경하지 않았다.

- LegacyGrid public boundary 연결 완료: root/core export와 examples Ground를 변경했고 public API 테스트가 기존 Drei Grid와 동일한 객체임을 확인한다. package consumer의 named export 목록에도 추가했다. `scripts/probe-r3f10-types.cjs <fixture>`는 root tsconfig의 src/examples/config 파일 937개를 대상으로 Fiber10/Drei11 선언을 사용하고 legacyDrei 소스만 Drei11 /legacy export로 가상 치환한다. diagnostics0. 현재 stable root 타입 검사와 publicApi/packageExports/World.loading 27 tests, production ESLint, test:demo 및 test:package 통과. 초기 static JS는 515,746 bytes 유지. TEMP/gaesup-legacy-grid-demo.log 및 gaesup-legacy-grid-package.log. main dependency·scene 저장 상태는 유지하며 native GPU 및 전체 월드 alpha browser 실행은 미완료다.

- 장면 생성 전 실패 browser gate를 완료했다. 현재 isolated Fiber10 alpha + 실제 WebGPURenderer의 StrictMode 실행에서 resize 실패와 readiness 실패 모두 생성2/해제2, rootsCreated1/rootsRemaining0, canvas0, frames0이며 주입한 원래 오류를 유지했다. 정상 3 cycles, context/resize/pointer, init 취소 및 init 실패도 함께 통과했고 Node child exit0을 확인했다. 로그 TEMP/gaesup-r3f10-early-browser.log. 아래의 early browser 미검증 기록은 이 결과로 갱신된다. 실제 backend는 WebGL2 fallback이므로 native WebGPU와 주 앱 통합 완료를 의미하지 않는다.

- 장면 생성 전 configure 실패 후 정리: 실패한 owned root에 scene이 없으면 비어 있는 Scene을 정리용으로 제공하고, XR 초기화 전이면 빈 연결 수명을 제공해 alpha의 null 접근을 피한다. `probe-r3f10-configure-failure.cjs`는 renderer.xr을 포함하는 stub으로 보강했고, 기본 resize 실패와 `--early` readiness 실패에서 원래 오류 보존·root 제거·owner dispose1·warning0을 각각 확인했다(exit0). browser harness에는 두 실패 시점을 함께 추가했으나 early 실패의 실제 브라우저 실행은 아직 미검증이다. Node syntax 검사 통과. 생산 코드·공개 API·주 의존성은 변경하지 않았다.

- 추가 configure 실패 browser gate: 실제 WebGPURenderer의 초기화 후 setSize 실패를 주입하니 alpha teardown이 아직 null인 state.xr.disconnect에서 예외를 내고 루트를 보존했다. 이전 Node stub에는 renderer.xr이 없어 이 분기를 검사하지 못했다. isolated OwnedCanvas는 configure가 XR 연결 전 실패한 경우에만 빈 XR lifecycle을 설정하고 정상 unmount 완료 후 renderer를 해제한다. 이 workaround는 실험 fixture에만 있으며 main Canvas에는 적용하지 않았다.
- `scripts/probe-r3f10-browser.cjs --strict`에 실패 후 원래 오류 보존, frames0, 생성2/해제2, rootsCreated1/rootsRemaining0, canvas0, 중복 해제 불변 검사를 추가했다. teardown 중단 경고도 실패로 처리한다. Node child process가 exit0을 확인했으며 정상 물리·resize·pointer·context 3 cycles와 cancel/init-failure 검사도 통과했다. 로그: TEMP/gaesup-r3f10-configure-browser-verified.log, 산출물: TEMP/gaesup-r3f10-browser-mBjs0a. 앞선 실행의 rendered-3.png도 직접 열어 장면을 확인했다.
- 실제 backend는 WebGL2 fallback이었다. native GPU, scene 생성 전 configure 실패, 생산 환경 통합과 package 전환은 미완료다. Node syntax 검사 통과; 이번 변경은 probe와 문서뿐이며 production API/의존성/상태 소유권은 변경하지 않았다.

- 안정 버전 단계 설치 및 build/root TypeScript, 전체 Jest 215 suites / 1941 tests 통과.
- browser GPU 장면의 분석 불가능한 bare import를 수정하고 package consumer를 다시 실행했다. ESM/CJS runtime smoke와 consumer build 통과.
- 실제 브라우저에서 GPU 장면과 WebGL2 대체 상태를 확인했다. native WebGPU adapter는 얻지 못했으며 native 경로의 성능/자원 검증은 남아 있다.
- FPS 초기값 편향을 제거하고 시간 구간별 프레임 수로 계산했다. lifecycle 15 tests와 변경 lint 통과. 소프트웨어 renderer의 FPS를 실제 장치의 성능 지표로 사용하지 않는다.

## R3F 10 type compatibility probe

- 독립 임시 프로젝트 gaesup-r3f10-audit-MltmE9에 fiber 10.0.0-alpha.4, drei 11.0.0-alpha.6, three 0.185.1, React 19.2.8을 정상 설치했다. 저장소 package/lockfile과 dev server는 변경하지 않았다. Rapier 2.2.0의 peer는 여전히 fiber ^9.0.4다.
- build tsconfig의 fiber/drei paths만 임시 설치의 실제 declaration entry로 바꾼 검사에서 40 diagnostics를 확인했다. 이는 런타임/물리 호환 성공을 의미하지 않는다.
- 공통 useBaseFrame/useBatchManagedEntities에서 clock 접근을 getFrameTimeMs 내부 경계로 이동했다. scheduler.elapsed(초) 우선, legacy clock.elapsedTime(초), performance.now(ms) 순으로 읽는다. 기존 throttle 단위 및 첫 프레임 처리 유지, 매 프레임 객체 생성 없음.
- 다음 순서: 나머지 effect/NPC/motion clock 호출 이관, Drei Text/Grid/Line/shaderMaterial export 경계, pointer/ref 타입, Rapier scheduler 실제 실행. 공통 frame 훅만 이관한 상태다.

### Effect timing slice

- getFrameElapsedSeconds를 내부 공통 경계로 제공하고 billboard/fire/flag/grass/sakura/snow/water, WaveEffect, NPCInstance, BugSpot, Footprints, CropPlot에서 사용한다. 기존 초 단위와 계수 유지. NPC는 프레임 내 시간을 한 번만 읽는다. sakura는 clock.getElapsedTime으로 전역 clock을 다시 갱신하지 않고 현재 frame 시간을 사용한다.
- CameraCalcProps.clock은 선택적 레거시 필드로 전환했다. 코어는 기존 deltaTime을 사용한다. DirectionComponent의 clock.stop/start는 자동화 실행 통합에서 제거했다.

### Camera and event/ref compatibility slice

- Camera hook은 renderer에 실제 THREE.Clock이 있을 때만 전달한다. R3F 10에서는 undefined이며 새 clock을 생성하지 않는다. 기존 clock을 제공하는 호출은 계속 허용하지만 clock을 직접 읽는 외부 controller는 optional 여부를 처리해야 한다.
- WallSystem/PassiveObjects에 실제 R3F ThreeEvent 타입을 적용했다. RemotePlayer는 movement group과 scaled animation root의 ref를 분리해 useAnimations가 같은 ref를 두 그룹에 붙이지 않도록 했다.
- 격리 alpha type probe: 14 → 9 diagnostics. 남은 9개는 모두 Drei export 이동이다. 설치된 Drei 11 package exports/declarations에서 legacy subpath에 Text/Grid/Line/shaderMaterial을 확인했다. webgpu에는 Grid/Line이 있고 Text/shaderMaterial은 없다.
- build/root 타입 검사, 변경 production ESLint, build:types 통과. camera/wall/network 14 suites / 77 tests, 추가 remote ref/API/export 3 suites / 26 tests 통과. 중복 suite가 포함된 수치이며 전체 테스트 수로 합산하지 않는다.
- main 의존성은 변경하지 않았다. 전체 Jest/demo/package 및 브라우저 shader/animation 검증은 이번 slice에서 미실행. 다음은 legacy import boundary와 Rapier scheduler 실제 실행 검증이다.

### Legacy helpers and actual scheduler probe

- src/core/rendering/legacyDrei.ts가 Text/Grid/Line/shaderMaterial의 내부 compatibility boundary다. 8개 소비 파일의 WebGL helper import를 이 경계로 모았으며 현재 설치된 Drei 10의 root export를 사용한다. 공개 export와 주 의존성은 변경하지 않았다.
- 임시 tsconfig-legacy.json에서 이 경계만 설치된 Drei 11 /legacy declaration으로 매핑하고 R3F 10 declarations를 사용했다. 원래 build 제외 경로를 절대 경로로 유지한 검사에서 9 diagnostics → 0. 이 검사는 main dependency 전환이나 native GPU 실행을 증명하지 않는다.
- scripts/probe-r3f10-rapier.cjs <fixture-directory>는 workspace의 실제 Rapier WASM을 fixture의 React/Three/Fiber에 연결한다. Module resolver 변경은 별도 probe 프로세스에만 적용되며 renderer만 stub이다. 300 useFrame, 초기 높이 5 → 지면 0.4987237, pause 60 frames 동안 높이 5 유지, resume 후 0.4366498, clock 없음, rigid body 제거와 root unmount 후 frame subscription 정지를 검증했다.
- Rapier 2.2.0 callback ref가 unmount 시 null이 되지 않는 점을 발견했다. R3F 9/10 모두 재현되었으며 Rapier 소스는 물리 객체를 제거하지만 callback null을 호출하지 않는다. resource 제거는 실제 world.getRigidBody로 검사하고 callbackRefCleared:false를 별도 출력한다. 이 문제를 R3F 10의 새 회귀나 완료된 ref 수명 검증으로 보고하지 않는다.
- Drei 11의 package exports에는 import만 있고 require 조건이 없다. 직접 require(root 및 /legacy)는 ERR_PACKAGE_PATH_NOT_EXPORTED. React/Fiber/Three를 external로 유지하고 Vite로 Drei root + 4 legacy helper를 CJS 번들링한 임시 probe는 188 exports를 Node에서 로드했다. 비압축 파일 크기 1,256,762 bytes(legacy 4종만 375,924 bytes). 이는 CJS 전환 전략의 가능성 검증이며 현재 library bundling 정책은 바꾸지 않았다.
- build/root 타입 검사, 변경 production ESLint, 관련 12 suites / 64 tests 및 ESM/CJS/declaration build와 test:demo 통과. test:demo는 큰 vendor chunk 및 기존 admin 정적/동적 import 혼용 경고를 출력했다. 실제 alpha browser/native WebGPU와 최종 패키지 전환은 계속 필요하다.
- test:package:built 최초 실행은 앞선 자동화 slice의 hasArrived가 ExpectedMouseState에 누락되어 실패했다. expected schema를 추가하고 optional/boolean 타입과 기존 필드 생략 객체를 함께 검사하도록 갱신했다. 재실행에서 ESM/CJS 및 exact-optional 양쪽 타입 검사, runtime import/require, consumer Vite build 통과. 주 패키지는 여전히 stable R3F/Drei다.
- 재사용 가능한 physics probe는 legacy advance의 초 단위와 R3F 10 scheduler의 밀리초 단위를 구분한다. R3F 9와 10 모두 300 frames에서 착지 높이 0.4987236857, 재개 후 0.4366498291로 일치한다. clock 존재 여부와 첫 frame delta 차이를 출력하며 GPU 성능 수치로 해석하지 않는다.

### 실제 renderer browser 및 반복 해제 검증

- scripts/probe-r3f10-browser.cjs와 scripts/fixtures/r3f10-browser는 설치된 isolated fixture의 React 19.2.8 / Three 0.185.1 / Fiber 10.0.0-alpha.4와 workspace Rapier를 실제 브라우저에 연결한다. 기존 5173 서버를 건드리지 않고 임시 서버·브라우저를 finally에서 닫는다.
- Fiber 10의 GPU factory는 Canvas.renderer에 전달해야 한다. gl prop은 legacy 경로를 선택한다. 설치된 alpha의 unmountComponentAtNode 구현은 root/scheduler/scene을 정리하지만 GPU renderer.dispose를 호출하지 않는다. 최초 실제 실행에서도 framework unmount 후 dispose count 0을 확인했다.
- Fixture의 명시적 소유자는 unmountComponentAtNode 완료 callback에서 renderer.dispose를 한 번 호출한다. 같은 페이지에서 생성→낙하→pause→resume→물리 제거→root 해제를 3회 실행했다. 생성/해제 3/3, 매 cycle 해제 후 20 DOM animation frames 동안 Fiber callback 증가 없음, 중복 release에도 dispose count 불변. 이것은 main Canvas 통합 완료가 아니며 async init 중 취소/StrictMode/복수 Canvas ownership은 추가 검증 대상이다.
- live renderer.info.memory는 매 cycle 동일하게 6,487,063 bytes, geometries 3 / textures 3 / programs 4, dispose 후 모든 카운터 0. Three의 info.dispose는 카운터 자체도 초기화하므로 이 값으로 실제 GPU 메모리 누수 부재를 증명하지 않는다. 457 callbacks의 누적 interval 22,065.8ms, 최대 116.7ms는 이 헤드리스 실행 관측치이며 성능 향상 수치가 아니다.
- WebGPURenderer는 실제로 WebGL2 fallback을 사용했다. --require-webgpu 실행은 exit 1로 fallback을 거부했다. native GPU gate는 여전히 미완료다. Rapier 초기화 인자 deprecation 및 해제된 root invalidate 경고도 남아 있다.
- 처음 frame drawCalls를 useFrame에서 기다린 검사는 timeout으로 실패했다. frame 단계별 reset에 의존하지 않는 누적 render.calls로 준비 상태를 검사하고 실제 3번째 렌더링 스크린샷을 열어 장면을 확인했다. 산출물: 시스템 임시 폴더 gaesup-r3f10-browser-noXgxE/rendered-{1,2,3}.png.
- Node syntax, Prettier, build TypeScript, diff check 통과. production runtime/API/package/lockfile 변경 없음. main R3F/Drei 전환, CJS packaging, native GPU 및 전체 앱 효과 검증은 남아 있다.

### Current partial-init disposal audit (2026-09-05)
- Inspected installed Three0.185.1 common Renderer.init/dispose/setAnimationLoop and WebGPUBackend.dispose. dispose guards initialized subsystem cleanup but still calls async setAnimationLoop(null), which awaits the cached initialization promise. Calling it after init rejection can create another rejected promise; no speculative partial cleanup was added.
- Replaced stale r178 factory documentation with this actual contract and clarified pre-init fallback versus propagated init failure. Rendering/next11 suites/77 tests, build TypeScript and scoped ESLint pass. This supports preserving failed-init behavior, not a proof of native GPU cleanup.
- Next renderer work should target owner cancellation after successful async init and main R3F10 ownership wiring. Native WebGPU, delayed-init cancellation and main migration remain incomplete.


### Overlapping asynchronous owner verification (2026-09-05)
- Existing performance GpuScene already releases a backend resolving after unmount. Added the missing overlapping-generation case: old backend waits, old view unmounts, new view starts rendering, then old backend resolves. Old resources release exactly once; its loop never starts; current loop identity and drawing remain intact until current unmount.
- GPU lifetime22 tests and root TypeScript pass. This is a mock-factory integration proof of the performance scene owner, not native WebGPU or R3F10 Canvas cancellation. Remaining cancellation work belongs to the main Canvas integration boundary, not another rewrite of this already-correct GpuScene owner.


### Pending R3F10 configuration cancellation gate (2026-09-05)
- Reproduced with actual isolated Fiber10.0.0-alpha.4 / Three185 modules and a stub renderer: unmount while renderer factory is pending throws from dispose(null scene). Root registration remains after late configure completion and framework renderer disposal count is0. scripts/probe-r3f10-cancellation.cjs --require-framework-cleanup exits1 as intended.
- Added --defer-unmount comparison. Waiting for configure to settle before owner disposal/root unmount completes without the premature-scene teardown error; root registration is removed and renderer disposal count is1. This is a bounded Node lifecycle probe, not a production cancellation wrapper or browser/native GPU proof. It does not handle a configure promise that never settles.
- Migration must explicitly own pending configure lifetime and late renderer disposal, prevent rendering cancelled generations, and verify actual Canvas StrictMode and overlapping mounts. The current main dependencies remain unchanged. No direct node_modules patch was made. Probe syntax check passed; main migration gate remains open.

### Owned root browser cancellation prototype (2026-09-05)
- The isolated browser fixture now owns createRoot/configure/render/unmount rather than relying on Canvas automatic teardown. Disposal waits for successful configure settlement, cancelled generations never render, and repeated release shares one cleanup promise. Child updates retain the root for pause/resume and physics removal.
- Fresh browser probe passed three create/physics/pause/resume/remove/dispose cycles, then a delayed-renderer-return cancellation with frames0, created1, disposed1 and root removed. The renderer is real WebGPURenderer using WebGL2 fallback; the delay is injected after renderer.init and before factory completion. This does not prove failed-init cleanup, never-settling promises, native WebGPU, same-canvas StrictMode replay, resizing/event parity or production integration.
- Node syntax and scoped diff checks passed. Artifacts: temporary gaesup-r3f10-browser-j0l5x0/rendered-3.png (visually inspected); log gaesup-r3f10-owned-cancellation.log. Main package/dependencies/public API unchanged. Next required lifecycle case is StrictMode overlapping configure on the same canvas before using this prototype in production.

### StrictMode owner isolation (2026-09-05)
- Added --strict browser probe mode. OwnedCanvas now creates a distinct DOM canvas inside each effect setup and removes that canvas on release. Each cancelled configure owns its root/renderer until settlement; old cleanup only clears rootRef when it still references that root. Probe handles are installed by the current owner rather than late renderer completion.
- Real React StrictMode / Fiber10 alpha browser run passed three physics/pause/resume/removal cycles:6 renderer creations and6 disposals. Delayed-return cancellation created2/disposed2 with0 scene frames. Rendered third-cycle image inspected at temporary gaesup-r3f10-browser-CVtQTg/rendered-3.png; log gaesup-r3f10-strict.log. Syntax checks passed.
- This prototype avoids sharing a canvas across replay generations; it does not establish that Fiber can safely reconfigure a shared pending canvas. WebGL2 fallback remains active. Production integration, event/resize parity, failed initialization and native WebGPU are still open. Main dependencies and public/persistent contracts unchanged.

### Owned-root resize integration (2026-09-05)
- Added a host ResizeObserver to the isolated OwnedCanvas prototype. Size updates use the store returned by root.render and its setSize API after configure completes; release disconnects the observer before detaching the owned canvas. The initial post-configure measurement also covers host changes while initialization was pending.
- Extended the actual isolated Fiber10 Node probe with --verify-resize. Landscape320x180 then portrait180x320 updated the stub renderer dimensions and actual camera aspect, and identical dimensions did not invoke renderer.setSize again. Deferred teardown still removed the root and disposed once. Probe/syntax checks passed.
- This proves the installed Fiber setSize contract, not the new ResizeObserver browser wiring. Browser resize/event checks and production integration remain pending. No main dependencies or public/persistent contracts changed.

### Browser resize and pointer gate
- Actual isolated React19.2.8/Fiber10.0.0-alpha.4/Three0.185.1 StrictMode probe passed. Resizing viewport960→640 updated canvas640x560 and camera aspect640/560 without recreating the renderer; pointer events reached scene meshes. Resizing back restored width960.
- Three physics/pause/removal cycles created6/disposed6 renderers, final renderer memory counters0. Delayed-return cancellation created2/disposed2 with0 frames. Real WebGPURenderer used WebGL2 fallback; native WebGPU remains unverified. Scheduler emitted root-not-found invalidation warnings during teardown; these were not counted as page/console errors and remain a production-readiness concern.
- Syntax checks passed. Artifact temporary gaesup-r3f10-browser-BCHrAs/resized.png visually inspected; log gaesup-r3f10-resize-pointer.log. No main dependency/public API/persistent contract changes. Production Canvas parity, context propagation, initialization failures and native GPU remain open.

## 2026-09-05 현재 패키지·셰이더 검증

- test:demo 통과: 초기 정적 import 7개 청크, 518658 JS bytes. 큰 Three/physics 청크 경고는 유지한다.
- verify-toon-water-nodes.mjs 통과: 물·풀·단일/인스턴싱 깃발의 WGSL/GLSL 생성 8조건. native GPU 실행이나 FPS 측정은 아니다.
- test:package는 OneDrive dist 정리 중 EPERM으로 실패했다. build:esm, build:cjs, build:types를 개별 실행해 산출물을 복원했다.
- 이후 test:package:built가 일부 미변환 선언의 NodeNext import 오류를 발견했다. OneDrive 파일이 Dirent.isSymbolicLink()로 반환되어 collectFiles에서 누락됐다. copy-cjs-types.cjs는 해당 파일의 실제 종류를 stat으로 확인하고 다른 경로로 연결되는 링크는 거부한다.
- 수정 후 build:types, production script ESLint, build noEmit, 공개 API/exports 25 tests, test:package:built 전체 소비 검증이 통과했다. 후자는 임시 소비자 설치, 엄격한 선언 검사, ESM/CJS 및 Vite build를 포함한다. 로그: TEMP/gaesup-current-package-built-check.log.
- source of truth, 공개 심볼과 기본 World Canvas는 유지했다. 현재 기본 renderer는 WebGL이며 native WebGPU 전체 월드 전환은 미완료다.
