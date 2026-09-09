# Spatial Runtime Capability Contract

이 문서는 미니홈, social world, 3D workspace 같은 제품이 공통으로 요구하는 runtime primitive의 경계를 정의한다.

## 1. Placement

현재 building에는 placement 관련 editor/store 구현이 있으므로 이를 폐기하지 않는다. 목표는 building-specific behavior를 보존하면서 여러 asset이 재사용할 수 있는 generic placement primitive를 단계적으로 추출하는 것이다.

owns:
- begin preview
- move
- rotate
- optional scale
- grid/surface snap
- bounds/collision validation
- commit/cancel
- serializable transform result

non-goals:
- 상품 소유권
- 사용자 권한
- database save
- 미니홈 비즈니스 규칙

규칙:
- building이 generic placement를 소비하는 방향을 우선한다.
- 기존 building placement를 한 번에 재작성하지 않는다.
- hot preview transform은 imperative path를 우선한다.

## 2. Avatar

현재 character controller, animation, cinematic expression/equipment capability를 재사용한다.

목표:
- model source와 controller를 분리하는 avatar adapter
- appearance/equipment/emote를 generic runtime surface로 통합

non-goals:
- 사용자 profile
- 구매/소유권
- social badge business rule

adapter 후보:
- GLB
- VRM
- custom

새 adapter 때문에 core movement controller 전체를 변경하지 않는다.

## 3. Pet Runtime

AI와 분리된 body runtime이다.

bounded intent 후보:
- move
- stop
- lookAt
- follow
- sit
- sleep
- emote
- interact
- idle

runtime owns:
- intent validation
- navigation/locomotion
- animation
- target tracking
- interruption/cancel policy

AI brain은 외부에 둔다.

## 4. Spatial Resource Binding

3D object와 application resource를 generic하게 연결한다.

contract:
- objectId
- resourceId
- resourceType
- optional serializable metadata

runtime interaction은 generic resource event를 발생시키고 실제 photo, document, product, dashboard 등의 의미는 application resolver가 해석한다.

금지:
- PhotoPost, Diary, Guestbook 같은 제품 타입을 core에 추가

## 5. Portal

현재 cinematic/gameplay teleport capability를 재사용한다. generic portal은 teleport 자체보다 destination resolve와 transition lifecycle을 추상화한다.

runtime owns:
- trigger
- destination descriptor
- preload hook
- transition lifecycle
- cancel/failure cleanup

application owns:
- URL routing
- destination permission
- friend/home business rule

## 6. Presence

현재 network context의 Durable/Replicated/Ephemeral 분류를 유지하며 presence는 Ephemeral로 취급한다.

runtime owns:
- remote entity pose/activity representation
- interpolation-facing state
- adapter bridge

provider owns:
- transport connection
- publish/subscribe

application owns:
- account session
- social visibility
- moderation

## 7. Capability Priority

P0:
1. generic placement seam
2. avatar adapter boundary
3. spatial resource binding
4. portal lifecycle

P1:
5. pet body runtime
6. presence bridge hardening
7. remote avatar runtime

P2:
8. LOD/streaming hardening
9. asset catalog scale optimization
10. animation layering
11. pet navigation refinement
