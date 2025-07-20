# Config Classification Validation Summary

## 검증 완료 도메인

### 1. Motions Domain
- **Store Config**: 물리 파라미터 (walkSpeed, jumpSpeed 등)
- **Constants**: 물리 엔진 한계값 (MIN_WALK_SPEED, GRAVITY_EARTH 등)
- **Realtime State**: 위치, 속도, 회전 등 매 프레임 계산값

### 2. Interactions Domain
- **Store Config**: 입력 설정 (mouseSensitivity, keyBindings 등)
- **Constants**: 입력 시스템 제약 (MAX_MOUSE_SENSITIVITY, INPUT_BUFFER_SIZE 등)
- **Realtime State**: 키보드, 마우스, 게임패드 상태

### 3. Camera Domain
- **Store Config**: 카메라 설정 (distance, smoothing, fovPreference 등)
- **Constants**: 카메라 하드웨어 제약 (MIN_DISTANCE, MAX_FOV 등)
- **Realtime State**: 카메라 위치, 매트릭스, 절두체 등

### 4. Animation Domain
- **Store Config**: 애니메이션 설정 (defaultFadeTime, qualityLevel 등)
- **Constants**: Three.js 제약 (MAX_ACTIVE_ACTIONS, BONE_COUNT_LIMIT 등)
- **Realtime State**: 애니메이션 액션, 블렌딩, 본 매트릭스 등

### 5. Building Domain
- **Store Config**: 건축 설정 (gridSize, snapToGrid, lodEnabled 등)
- **Constants**: 메모리 제약 (MAX_BLOCKS_PER_CHUNK, MESH_COMBINE_THRESHOLD 등)
- **Realtime State**: 블록, 청크, 선택 상태 등

### 6. Blueprint Domain
- **Store Config**: 블루프린트 설정 (maxEntitiesPerBlueprint, cacheEnabled 등)
- **Constants**: 파싱 제약 (MAX_BLUEPRINT_SIZE, JSON_PARSE_MEMORY_LIMIT 등)
- **Realtime State**: 로딩 상태, 엔티티 풀, 캐시 등

## 핵심 원칙 검증

### 1. Store Config 사용 원칙 ✅
- 유저가 설정 페이지에서 변경하는 값
- 게임 시작 시 초기화되는 값
- 이벤트 드리븐으로 변경되는 값
- Bridge를 통해 Core로 1회성 전달

### 2. Constants 사용 원칙 ✅
- 컴파일 타임에 결정되는 절대 불변값
- 하드웨어/엔진 제약사항
- 성능 보장을 위한 임계값
- `as const`로 타입 안전성 보장

### 3. Realtime State 금지 원칙 ✅
- 매 프레임 계산되는 값은 Store 절대 금지
- Core Layer에서만 관리
- ref 기반으로만 접근
- React 상태 관리 배제

## 데이터 플로우 검증

### 올바른 플로우 ✅
```
Settings UI → Store → Bridge → Core (Config 변경)
Core → Core (매 프레임 계산)
Core → UI (ref를 통한 읽기)
```

### 금지된 플로우 ❌
```
Core → Store (매 프레임)
Store → Core (매 프레임)
매 프레임 Store 구독
```

## 성능 최적화 검증

### 1. 메모리 효율성 ✅
- 객체 풀링 시스템 구현
- LRU 캐시 활용
- 공간 분할 구조 사용
- 청크 기반 최적화

### 2. 렌더링 최적화 ✅
- 절두체 컬링
- LOD 시스템
- 인스턴스드 메시
- 메시 결합 최적화

### 3. 계산 최적화 ✅
- 프레임 예산 관리
- 지연 계산
- 배치 처리
- 공간 쿼리 최적화

## 아키텍처 무결성 검증

### Layer 1 (Core) ✅
- 물리 계산, 렌더링, 애니메이션
- Store 접근 없음
- ref 기반 상태 관리
- 60fps 안정성 보장

### Layer 2 (Bridge/Hooks/Stores) ✅
- Config 변경 감지 및 전달
- Core와 UI 간 인터페이스
- 선택적 구독 패턴
- 리렌더 최소화

### Layer 3 (UI Components) ✅
- 사용자 설정 인터페이스
- 디버깅 정보 표시
- 이벤트 처리
- Store를 통한 Config 변경

## 잠재적 위험 요소

### 1. Config Drift 방지
- Config 값이 Store → Core 전달 후 Core에서 독립적으로 변경되는 현상
- **해결책**: Config 변경은 반드시 Store를 통해서만

### 2. Memory Leak 방지
- 이벤트 리스너, 타이머, 풀 객체 정리
- **해결책**: cleanup 함수와 메모리 모니터링

### 3. Circular Dependency 방지
- 블루프린트 간 순환 참조
- **해결책**: 의존성 그래프와 토폴로지 정렬

## 검증 완료 체크리스트

- [x] 모든 도메인의 Config 분류 완료
- [x] Store Config vs Constants vs Realtime State 명확히 구분
- [x] 데이터 플로우 검증
- [x] 성능 최적화 패턴 검증
- [x] 아키텍처 레이어 분리 검증
- [x] 잘못된 패턴 예시 제공
- [x] 올바른 구현 패턴 제공

## 결론

모든 도메인에서 Config 분류가 올바르게 이루어졌으며, 다음과 같은 이점을 보장합니다:

1. **성능 안정성**: 매 프레임 60fps 보장
2. **메모리 효율성**: 불필요한 리렌더와 GC 압박 제거
3. **아키텍처 무결성**: 레이어 간 책임 명확히 분리
4. **확장성**: 새로운 도메인 추가 시 일관된 패턴 적용 가능
5. **유지보수성**: 명확한 데이터 플로우와 책임 분리

이제 실제 코드베이스에 이 분류를 적용하여 기존 Store Config를 재정비할 준비가 완료되었습니다. 