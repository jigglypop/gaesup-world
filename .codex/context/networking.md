# Networking

## 상태 분류

- Durable: house, wall, furniture, ownership, post와 persistent 객체.
- Replicated: 문 상태, 공유 interaction, 임시 공유 객체.
- Ephemeral: avatar transform, 머리 회전, typing, cursor, presence.

모든 상태는 authority, replication 주기, persistence 정책, conflict 동작을 선언한다.

## 계약 규칙

- network contract는 `{ x, y, z }` 같은 engine-neutral primitive를 사용한다.
- Three.js 객체, Rapier handle, React ref, Zustand store는 계약을 넘지 않는다.
- command는 의도를 표현하고, accepted event와 snapshot은 authority를 표현한다.
- delta, interpolation, reconciliation은 상태 분류별로 명시한다.

기존 adapter, authority contract, MessageQueue, ConnectionPool, worker, visit 구현을 보존한다. 직접적인 Three.js 의존은 변경하기 전에 migration debt로 기록한다.
