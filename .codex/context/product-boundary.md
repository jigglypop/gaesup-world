# Product Boundary

## Identity

`gaesup-world`는 특정 SNS, 미니홈피, 게임 또는 AI 제품 자체가 아니라 여러 제품이 소비하는 공용 3D spatial runtime/library다.

## Core에 허용되는 개념

- world, scene, entity
- asset, placement, building
- avatar, pet body
- animation, camera, physics, navigation
- interaction, portal
- spatial resource binding
- network runtime, presence bridge
- save/runtime persistence abstraction
- media runtime
- editor/runtime projection

## Core에 금지되는 제품 개념

- account, login business rule
- friend, follow, social graph
- guestbook, diary, feed, post, comment, like
- shop pricing, payment, subscription
- product-specific home ownership policy
- AI memory, personality, emotion reasoning, LLM prompt, agent planning
- recommendation, moderation

제품 개념이 필요하면 application/backend가 소유하고 `gaesup-world`는 provider, adapter, event 또는 engine-neutral contract만 제공한다.

## Pet Boundary

원칙:

- AI = brain
- gaesup-world = body

`gaesup-world`가 소유하는 것:

- pet locomotion
- navigation
- target tracking
- animation
- interaction execution
- bounded intent execution

외부 AI가 소유하는 것:

- memory
- personality
- emotion model
- reasoning
- planning
- dialogue generation

AI output은 arbitrary code가 아니라 제한된 `PetIntent` contract로만 runtime에 들어온다.

## Backend Boundary

서버 canonical state와 gaesup-world runtime state를 분리한다.

Library:

- serializable snapshot/command/event contract
- runtime hydration/projection
- local SaveSystem abstraction

Application/backend:

- ownership
- authorization
- canonical database
- social data
- billing
- content persistence

## Decision Test

새 기능을 core에 추가하기 전 다음을 묻는다.

1. 이 기능은 미니홈피가 없어도 다른 3D application에서 재사용 가능한가?
2. 사용자/친구/상품 같은 product entity 없이 설명 가능한가?
3. engine-neutral contract로 외부 시스템과 분리 가능한가?

세 질문 중 하나라도 아니면 application layer가 소유하는 것을 우선한다.
