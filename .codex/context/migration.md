# Migration Strategy

## 방법

작은 strangler migration slice를 사용한다. 하나의 slice는 하나의 architecture boundary만 바꾸고 월드가 항상 실행 가능한 상태를 유지한다.

모든 active plan은 목표, 현재 상태, 문제, 범위, 제외 범위, 현재·목표 source of truth, 호환성 전략, 리스크, 테스트, 성능 체크, 완료 조건을 기록한다.

## Epochs

1. Epoch 0: 빌드, 테스트, 라우트, examples UX, renderer 의존성을 기록한다.
2. Epoch 1: Codex 하네스, architecture context, invariant를 설치한다.
3. Epoch 2: simulation을 바꾸지 않고 examples shell, 시나리오 라우트, 개발자 분리를 도입한다.
4. Epoch 3: 호환성 테스트와 함께 R3F 10 alpha로 이관한다.
5. Epoch 4: WebGPURenderer, capability 감지, 명시적 WebGL fallback을 도입한다.
6. Epoch 5: RenderSnapshot, GPU buffer, instancing, batching, LOD, visibility, resource ownership을 통합한다.
7. Epoch 6: WorldDocument, entity, component, command, event, schema version을 정의한다.
8. Epoch 7: placement와 spatial 특화 자산을 보존하면서 building command와 projection을 통합한다.
9. Epoch 8: collider, socket, LOD, Meshopt, KTX2 메타데이터를 갖춘 Blender-to-manifest asset 파이프라인을 추가한다.
10. Epoch 9: network authority, snapshot, delta, interpolation, reconciliation을 정식화한다.
11. Epoch 10: identity, ownership, visit, presence, chat, post 참조를 프로토타입한다.

R3F migration, WorldDocument 도입, building 재작성, networking 재작성, examples 재작성을 하나의 slice에 결합하지 않는다.
