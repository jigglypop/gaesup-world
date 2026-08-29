# Networking

## State classes

- Durable: house, wall, furniture, ownership, posts and persistent objects.
- Replicated: door state, shared interactions and temporary shared objects.
- Ephemeral: avatar transform, head rotation, typing, cursor and presence.

Every state declares authority, replication frequency, persistence policy and conflict behavior.

## Contract rules

- Network contracts use engine-neutral primitives such as `{ x, y, z }`.
- Three.js objects, Rapier handles, React refs and Zustand stores do not cross the contract.
- Commands express intent; accepted events and snapshots express authority.
- Delta, interpolation and reconciliation are explicit per state class.

Preserve the existing adapter, authority contract, MessageQueue, ConnectionPool, worker and visit implementation. Record direct Three.js dependencies as migration debt before changing them.
