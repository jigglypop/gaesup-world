# Blueprint Architecture

## 개요

Blueprint는 게임 내 모든 엔티티(캐릭터, 차량, 아이템 등)의 데이터 정의를 중앙화한 시스템입니다. 도메인 독립적이며, 각 도메인은 필요한 부분만 선택적으로 소비합니다.

## 위치 및 구조

```
src/blueprints/              # 최상위 레벨 (도메인 독립적)
├── characters/              # 캐릭터 정의
│   ├── warrior.ts
│   ├── mage.ts
│   ├── archer.ts
│   └── types.ts
├── vehicles/                # 탈것 정의
│   ├── car.ts
│   ├── airplane.ts
│   ├── bike.ts
│   └── types.ts
├── animations/              # 애니메이션 시퀀스
│   ├── combat/
│   │   ├── sword-combo.ts
│   │   └── magic-cast.ts
│   ├── movement/
│   │   ├── walk-cycle.ts
│   │   └── jump-sequence.ts
│   └── types.ts
├── behaviors/               # AI/행동 패턴
│   ├── npc/
│   │   ├── merchant.ts
│   │   └── guard.ts
│   ├── enemy/
│   │   ├── patrol.ts
│   │   └── aggressive.ts
│   └── types.ts
├── items/                   # 아이템 정의
│   ├── weapons/
│   ├── consumables/
│   └── types.ts
├── types.ts                 # 공통 타입 정의
└── index.ts                 # 공개 API
```

## 핵심 타입 정의

```typescript
// types.ts
export type Blueprint = {
  id: string;                // 고유 식별자
  name: string;              // 표시 이름
  description?: string;      // 설명
  version: string;           // 버전 관리
  tags?: string[];           // 검색/필터링용 태그
  metadata?: Record<string, unknown>;
};

export type CharacterBlueprint = Blueprint & {
  type: 'character';
  
  // 물리 속성 (motions 도메인에서 사용)
  physics: {
    mass: number;
    height: number;
    radius: number;
    jumpForce: number;
    moveSpeed: number;
    runSpeed: number;
    airControl: number;
  };
  
  // 애니메이션 (animation 도메인에서 사용)
  animations: {
    idle: string | string[];
    walk: string | string[];
    run: string | string[];
    jump: {
      start: string;
      loop: string;
      land: string;
    };
    combat?: Record<string, string | string[]>;
    special?: Record<string, string | string[]>;
  };
  
  // 행동 트리 (npc/ai 도메인에서 사용)
  behaviors?: {
    type: 'state-machine' | 'behavior-tree';
    data: unknown;
  };
  
  // 능력치 (game-logic 도메인에서 사용)
  stats: {
    health: number;
    stamina: number;
    mana?: number;
    strength: number;
    defense: number;
    speed: number;
  };
  
  // 시각적 요소 (rendering 도메인에서 사용)
  visuals?: {
    model: string;
    textures?: string[];
    materials?: Record<string, unknown>;
    scale?: number;
  };
};

export type VehicleBlueprint = Blueprint & {
  type: 'vehicle';
  
  physics: {
    mass: number;
    maxSpeed: number;
    acceleration: number;
    braking: number;
    turning: number;
    suspension?: unknown;
  };
  
  seats: Array<{
    position: [number, number, number];
    rotation?: [number, number, number];
    isDriver: boolean;
  }>;
  
  animations: {
    idle: string;
    moving?: string;
    wheels?: string[];
  };
};

export type AnimationSequence = Blueprint & {
  type: 'animation-sequence';
  
  clips: Array<{
    name: string;
    file: string;
    duration: number;
    loop?: boolean;
    events?: Array<{
      time: number;
      type: string;
      data?: unknown;
    }>;
  }>;
  
  transitions?: Array<{
    from: string;
    to: string;
    duration: number;
    condition?: string;
  }>;
};

export type BehaviorTree = Blueprint & {
  type: 'behavior-tree';
  
  root: BehaviorNode;
  blackboard?: Record<string, unknown>;
};

type BehaviorNode = {
  type: 'sequence' | 'selector' | 'parallel' | 'action' | 'condition';
  children?: BehaviorNode[];
  action?: string;
  condition?: string;
  parameters?: Record<string, unknown>;
};
```

## Blueprint 예시

```typescript
// characters/warrior.ts
export const WARRIOR_BLUEPRINT: CharacterBlueprint = {
  id: 'char_warrior_basic',
  name: 'Basic Warrior',
  type: 'character',
  version: '1.0.0',
  tags: ['melee', 'tank', 'starter'],
  
  physics: {
    mass: 80,
    height: 1.8,
    radius: 0.3,
    jumpForce: 350,
    moveSpeed: 5,
    runSpeed: 10,
    airControl: 0.2
  },
  
  animations: {
    idle: 'warrior_idle.glb',
    walk: 'warrior_walk.glb',
    run: 'warrior_run.glb',
    jump: {
      start: 'warrior_jump_start.glb',
      loop: 'warrior_jump_loop.glb',
      land: 'warrior_jump_land.glb'
    },
    combat: {
      attack_light: ['attack_1.glb', 'attack_2.glb', 'attack_3.glb'],
      attack_heavy: 'attack_heavy.glb',
      block: 'block.glb',
      parry: 'parry.glb'
    }
  },
  
  behaviors: {
    type: 'state-machine',
    data: {
      initial: 'idle',
      states: {
        idle: {
          on: {
            MOVE: 'moving',
            ATTACK: 'combat'
          }
        },
        moving: {
          on: {
            STOP: 'idle',
            ATTACK: 'combat'
          }
        },
        combat: {
          on: {
            FINISH: 'idle'
          }
        }
      }
    }
  },
  
  stats: {
    health: 100,
    stamina: 50,
    strength: 15,
    defense: 12,
    speed: 10
  },
  
  visuals: {
    model: 'warrior_model.glb',
    textures: ['warrior_diffuse.png', 'warrior_normal.png'],
    scale: 1.0
  }
};
```

## 도메인별 Blueprint 사용

### Motions 도메인
```typescript
// src/core/motions/hooks/useCharacterMotion.ts
import { WARRIOR_BLUEPRINT } from '@blueprints/characters/warrior';

function useCharacterMotion(blueprintId: string) {
  const blueprint = getBlueprint(blueprintId);
  
  // physics 속성만 사용
  return usePhysicsEntity({
    mass: blueprint.physics.mass,
    jumpForce: blueprint.physics.jumpForce,
    moveSpeed: blueprint.physics.moveSpeed
  });
}
```

### Animation 도메인
```typescript
// src/core/animation/hooks/useCharacterAnimation.ts
import { WARRIOR_BLUEPRINT } from '@blueprints/characters/warrior';

function useCharacterAnimation(blueprintId: string) {
  const blueprint = getBlueprint(blueprintId);
  
  // animations 속성만 사용
  return useAnimationPlayer({
    clips: blueprint.animations,
    defaultClip: 'idle'
  });
}
```

### NPC 도메인
```typescript
// src/core/npc/hooks/useNPCBehavior.ts
import { MERCHANT_BLUEPRINT } from '@blueprints/behaviors/npc/merchant';

function useNPCBehavior(blueprintId: string) {
  const blueprint = getBlueprint(blueprintId);
  
  // behaviors 속성만 사용
  return useBehaviorTree(blueprint.behaviors);
}
```

## Blueprint 시스템의 장점

1. **중앙 집중화**: 모든 게임 데이터가 한 곳에
2. **재사용성**: 동일한 데이터를 여러 시스템에서 공유
3. **유지보수성**: 데이터 변경이 한 곳에서만 필요
4. **확장성**: 새로운 Blueprint 타입 추가가 쉬움
5. **타입 안정성**: TypeScript로 완전한 타입 정의
6. **버전 관리**: 각 Blueprint에 버전 정보 포함
7. **도메인 독립성**: 각 도메인은 필요한 부분만 선택적 사용

## 모범 사례

1. **명명 규칙**
   - ID: `{type}_{category}_{name}` (예: `char_warrior_basic`)
   - 파일명: kebab-case (예: `warrior-basic.ts`)
   - 상수명: UPPER_SNAKE_CASE (예: `WARRIOR_BLUEPRINT`)

2. **버전 관리**
   - Semantic Versioning 사용 (예: `1.0.0`)
   - Breaking changes는 major 버전 증가

3. **데이터 검증**
   - Blueprint 로드 시 스키마 검증
   - 필수 필드 누락 검사

4. **성능 최적화**
   - Blueprint는 빌드 타임에 번들링
   - 런타임에는 읽기 전용으로 사용

5. **확장성**
   - 새 필드는 optional로 추가
   - 기존 필드 제거 시 deprecation 경고 