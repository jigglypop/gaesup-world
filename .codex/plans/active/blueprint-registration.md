# Blueprint default registration

- Spawner execution/lifetime follow-up: BlueprintSpawner가 소유한 현재 엔티티를 useFrame delta로 갱신한다. 교체·언마운트에서는 소유 참조를 먼저 끊고 해제하며, 취소된 비동기 생성 결과는 알림 없이 폐기한다. callback 변경은 재생성을 유발하지 않는다. React DOM 기반 회귀 테스트로 frame 전달, 늦은 완료, 역순 완료, StrictMode 재실행과 최신 destroy callback을 검증했다. Blueprint 7 suites / 14 tests, memory 5 suites / 88 tests, build TypeScript와 production lint 통과. 입력·접지·점프 애니메이션 연결과 실제 브라우저 검증은 미완료이며 이 plan은 active로 유지한다.

- Placeholder identity follow-up: CharacterBehavior properties.type='aggressive'가 IComponent.type까지 덮어써 등록 이름으로 조회할 수 없는 회귀를 재현했다. 공통 기본 객체는 props 적용 후 component type/lifecycle을 확정한다. 원본 BlueprintDefinition의 행동 설정은 유지한다. 동일한 placeholder 등록 11개를 하나의 반복으로 통합했다. blueprint 10 tests, build 타입·lint·diff check 통과. Placeholder gameplay 동작을 구현한 것으로 간주하지 않는다.

- 기본 컴포넌트 등록의 canonical 경로를 registerDefaultComponents로 통일한다. BlueprintFactory의 별도 빈 기본 구현은 제거한다. ComponentRegistry가 기존 구현과 사용자 override를 소유한다.
- 기본 등록은 누락된 종류만 채운다. 명시적인 register/registerComponentFactory는 기존 교체 의미를 유지한다. Factory 최초 생성과 반복적인 hook 등록 어느 순서에서도 실제 이동/애니메이션 구현을 빈 구현으로 덮어쓰지 않는다.
- 공개 시그니처와 저장 모델은 유지한다. Factory만 사용하던 경로에서도 기존 실제 CharacterMovement/CharacterAnimation/GravityForce 기본 구현을 사용하게 되는 동작 교정이다. 능력치·행동 등 placeholder 구현의 기능 완성을 의미하지 않는다.
- 검증: factory-first 및 사전 등록 경로, 반복 기본 등록, 사용자 override 보존, blueprint/motion 테스트, build 타입/린트. 실제 브라우저 캐릭터 동작 확인은 후속 검증이며 이 plan은 그 전까지 active다.

- 기본 등록을 다시 호출할 때 customVehicle이 anonymous 기본 구현으로 교체되는 회귀를 재현했다. 수정 후 factory-first 초기화, 반복 등록에서 factory 참조 유지, 실제 CharacterMovementComponent 생성, 명시적 override 이후 재등록 보존 검증 통과. blueprint/motions 22 suites / 136 tests, build 타입·lint·diff check 통과.

- Spawn physics follow-up (2026-09-05): ID 조회와 직접 전달 모두 blueprint 질량을 반영하고 캐릭터→차량/비행기 전환 시 회전 잠금을 해제한다. converter와 spawner의 물리 기본값 계산은 factory/physics.ts를 공유한다. 7 suites / 17 tests, build 타입과 production lint 통과. 테스트는 Rapier props까지 검증하며 실제 충돌체 질량·브라우저 조작은 미검증이다. Preview가 GaesupController를 사용하는 점을 확인했다. BlueprintSpawner의 입력은 조작 대상의 명시적인 소유권과 접지 상태 주입을 함께 설계해야 하며 아직 연결하지 않았다.

- ID hook resolution (2026-09-05): useBlueprintEntity resolves registered IDs through the existing BlueprintFactory conversion path. Direct BlueprintDefinition input remains supported; unknown IDs report an error and leave no active entity. Hook state exposes created/replaced entities, while frame execution uses the owned ref. Replacement, disabling and StrictMode release each entity once. Blueprint/motion 30 suites / 168 tests; hook/export 3 suites / 27 tests; memory 5 suites / 88 tests; build/root TypeScript and production ESLint passed. Input, grounding, animation loading and browser integration remain open.


- Entity input contract (2026-09-05): BlueprintEntity.update accepts optional BlueprintMovementInput and overwrites the reused ComponentContext field every frame, including clearing it when input is omitted. BlueprintSpawner and useBlueprintEntity forward optional getMovementInput callbacks without rebuilding entities. CharacterMovement consumes only this entity-local input, including supplied grounding and camera yaw; it no longer reads window keyboard/mouse state. Missing input leaves physics velocity untouched. Grounded jump uses a press edge to prevent repeated impulses while held. Public additions flow through existing blueprint core exports; no new subpath. Consumers that manually populated the old window globals must now supply the callback/update input. Actual example input-adapter selection and per-body ground detection remain REQUIRED, as do browser movement/jump verification and clip loading. This plan remains active.


- Example movement integration (2026-09-05): /blueprint-playground is a lazy developer scenario, linked from the catalog and blueprint editor in a new tab to preserve unsaved edits. It consumes public useBlueprintEntity and BlueprintConverter with WARRIOR_BLUEPRINT, uses focus-scoped input, and supplies per-body downward ray grounding excluding sensors/self. Reused ray/input avoid per-frame integration allocations except Rapier query results. Capsule visualization deliberately exposes physics without claiming model/clip integration. Actual browser movement/jump, touchscreen controls, and animation loading remain incomplete.


- Browser scenario check (2026-09-05): mobile390x844 screenshot inspection confirms movement and jump in the example. Header overlap corrected; touch-style hold buttons added with pointer capture and release/cancel/window-blur cleanup. Browser page errors zero; root TS/lint pass. This validates the capsule movement path, not model clips or native touch hardware. Exact post-release settling, model integration and remaining blueprint contracts keep this plan active.


- Jump animation phases (2026-09-05): Structured start/loop/land clip registration and phase transitions now use entity grounding when available. Real Three.js tests cover takeoff, apex/descent looping and landing completion. Global clip-source replacement and example model/clip loading remain open; this plan stays active.


- Entity clip injection (2026-09-05): BlueprintAnimationClips is an optional borrowed clip map on runtime context, constructor/factory config, spawner props and useBlueprintEntity. CharacterAnimation uses only this context map; manual window.__loadedAnimations consumers must migrate to animationClips. Hook/spawner replace and dispose the owned entity when the clip-map identity changes, so consumers should memoize loaded maps. Existing wildcard core exports expose the new type without a new subpath. Two real factory entities with different same-named clips remain isolated across disposal. Model loading into the actual example and browser animation validation remain required.


- Model integration (2026-09-05): Playground loads local ally_body GLB and Draco assets, supplies memoized embedded clips and cloned root to blueprint entity; warrior locomotion defaults match inspected GLB clip names. Borrowed loader resources remain intact; owned skeletons clean up. Shipped-asset contract and related tests pass. Browser visual/playback and repeated-reset lifetime verification remain open before completion.


- Actual model browser check (2026-09-05): loaded model/movement/jump pose and four repeated-reset recovery verified in mobile/desktop screenshots. Live WebGL texture count stayed9 across all four resets, twice. Other GPU resources and exact animation phase timing are not covered. Plan remains active for remaining blueprint integration contracts.
