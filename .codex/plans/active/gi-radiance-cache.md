# GI: 복셀 트레이스 + 프로브 래디언스 캐시

## 목표와 범위

- 동적 전역 조명(간접 확산광, 무한 바운스, 스카이/에미시브 기여)을 WebGPU에서 제공한다. 정적 베이크가 아니라 건물 편집 결과를 변경마다 반영한다.
- source of truth는 그대로 building 스토어다. GI의 복셀 볼륨과 프로브는 그 위의 파생 projection이며 저장·네트워크 대상이 아니다(INV-002, INV-005). 저장 형식과 network 계약은 바꾸지 않는다.
- 근거: 월드는 4m 격자, 1m 높이 단계, 벽 두께 0.5m의 축 정렬 박스라 타일·벽·블록 AABB를 복셀 점유로 직접 변환할 수 있다. SDF 생성과 서피스 캐시 없이 복셀 DDA로 정확한 레이 트레이스가 가능하다.
- 알고리즘: 복셀 점유 볼륨(재질 팔레트 포함)에 3D DDA로 프로브 레이를 쏜다. 프로브마다 방사휘도를 L1 구면조화로 투영해 저장하고, 히트 지점 셰이딩에 이전 프레임 프로브 값과 직사광(그림자 레이 포함)을 사용해 다중 바운스를 얻는다. 셰이딩은 프로브 SH를 채널당 RGBA 3D 텍스처 3장으로 올려 하드웨어 삼선형 보간으로 읽고 TSL emissiveNode로 더한다.
- 프로브 갱신은 CPU에서 한다. 프레임당 예산만큼 프로브를 순환 갱신하고, 편집된 영역은 우선 갱신한다. GPU 컴퓨트는 이 CPU 참조 구현과 수치를 비교하며 옮길 후속 최적화다.
- WebGL fallback은 GI 없음(기존 ambient)이다. 셰이더 모듈은 동적 import로만 로드한다(INV-016, INV-017).

## slice

1. `src/core/gi/core/` 순수 수학 코어(복셀 그리드, DDA, 샘플링, SH, 프로브 볼륨, 복셀 장면). 완료.
2. building 상태를 복셀 박스로 변환(`gi/utils`), `GiVolume` 컴포넌트, TSL 조도 노드(`rendering/tsl/gi.ts`), 공개 API, `examples/pages/GiPage`. 코드 작성 완료, 브라우저 미검증.
3. 후속: 메인 월드 Canvas의 WebGPU 전환 후 building 머티리얼에 연결, 프로브 갱신의 GPU 컴퓨트 이관, 가시성(Chebyshev) 가중, 동적 캐릭터 복셀화, GTAO/SSGI 보강.

## 제외

- 메인 월드 Canvas의 WebGPU 전환은 renderer-modernization plan이 소유한다. GI는 예제 페이지의 자체 WebGPU Canvas에서 먼저 동작한다.
- 발광 재질에는 GI를 적용하지 않는다(`applyToMaterial`은 emissiveNode를 더하며 material.emissive와의 합성은 검증하지 않았다).
- 리스크: 셰이더 정확성, TSL/`texture3D` API 일치, 프로브 갱신의 CPU 비용은 브라우저 실측 전까지 확인되지 않았다.

## 검증

- 실행한 것: Node 타입 스트리핑 러너에서 `src/core/gi` 테스트 66개(무작위 레이 3000개를 레이 마칭과 대조, 의도적 변이 주입 시 실패 확인, 밀폐된 방의 다중 바운스가 해석해 e/(1-albedo)=0.4에 ±0.001로 수렴, 하늘 반구 SH가 위 1·옆 0.5·아래 0을 재현). jest 통과를 대체하지 않는다.
- 예제 씬 CPU 시뮬레이션(Node, 프로브 3200개 x 레이 48, 프레임당 48프로브): 평균 1.5ms/프레임, 최악 8.6ms, 전체 순환 67프레임. 태양 방위 60도/고도 18도에서 붉은 벽 옆 바닥이 r/g 1.9로 붉게 물들고 기본값(중립)은 1.07이다. 브라우저 실측은 아니다.
- 실행하지 못한 것: `node_modules`가 없어 jest, tsc, eslint, 브라우저 실행. 다음을 실행해야 한다.
  - `pnpm test -- src/core/gi src/__tests__/publicApi.test.ts examples/config --runInBand`
  - `pnpm exec tsc -p tsconfig.build.json --noEmit` (특히 `rendering/tsl/gi.ts`의 three/tsl 타입)
  - 변경 파일 eslint, `/gi` 라우트 브라우저 확인(WebGPU)

## 완료 조건

- [x] slice 1: 코어 함수와 테스트 작성, 해석해 기반 검증.
- [ ] slice 2: jest·tsc·eslint 통과, `/gi`에서 창으로 들어온 햇빛의 색 번짐 확인, 프로브 갱신 CPU 시간과 프레임 영향 기록.
- [ ] 검증 실행·통과 후 HARNESS.md 기록 append
