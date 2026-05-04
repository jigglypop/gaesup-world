# Gaesup World 프로젝트 개요

## 한 줄 설명

Gaesup World는 웹에서 동작하는 3D 월드/게임을 만들기 위한 React 기반 라이브러리입니다. 단순 캐릭터 컨트롤러를 넘어서, 월드 상태 관리, 상호작용, 건설, 생활형 시스템, 멀티플레이어, 블루프린트 기반 엔티티 생성까지 포함하는 확장형 구조를 목표로 합니다.

## 프로젝트 성격

이 저장소는 하나의 앱이라기보다 아래 두 성격을 동시에 가집니다.

- 배포 가능한 라이브러리
- 라이브러리를 검증하는 데모/샘플 앱

구조적으로는 `src/`의 라이브러리 코드와 `examples/`의 데모 앱이 함께 유지됩니다.

## 현재 구조

### 최상위 디렉터리

- `src/`: 라이브러리 본체
- `examples/`: Vite 기반 데모 앱
- `public/`: 데모 리소스, 폰트, glTF, wasm 등
- `server/`: 멀티플레이어 테스트용 WebSocket 서버
- `docs/`: 도메인/설계/API/가이드 문서

### 엔트리 포인트

- 라이브러리 엔트리: `src/index.ts`
- 코어 집합 엔트리: `src/core/index.ts`
- 데모 앱 엔트리: `examples/App.tsx`

## 아키텍처 개요

Gaesup World는 대체로 3계층 구조를 따릅니다.

### 1. Core / Engine 계층

실제 계산과 시스템 동작이 있는 계층입니다.

- Three.js 렌더링
- Rapier 물리
- 엔티티/시스템 로직
- 네트워크/저장/시간 계산

### 2. State / Hooks 계층

React와 엔진 사이를 연결하는 계층입니다.

- Zustand store
- React hook
- bridge 패턴
- 시스템 snapshot/command 흐름

### 3. UI / Components 계층

사용자가 직접 보게 되는 계층입니다.

- HUD
- 인벤토리 UI
- 퀘스트 로그
- 카메라 패널
- 블루프린트/건설 에디터
- 관리자 UI

## 핵심 설계 포인트

### Bridge 패턴

여러 도메인에 bridge 개념이 들어가 있습니다.

- UI/Hook 쪽에서 명령 전달
- Core/System 쪽에서 계산 수행
- snapshot 또는 store 갱신으로 상태 반영

이 방식 덕분에 렌더링/UI와 엔진 로직을 비교적 느슨하게 분리할 수 있습니다.

### 도메인 분리

기능이 큰 단위로 분해되어 있어, 특정 시스템만 따로 확장하거나 교체하기 쉽습니다.

대표 도메인:

- `animation`
- `camera`
- `motions`
- `interactions`
- `world`
- `building`
- `networks`
- `time`
- `save`
- `inventory`
- `quests`
- `weather`
- `town`
- `audio`
- `npc`
- `blueprints`
- `admin`

### 블루프린트 기반 확장

엔티티를 코드만이 아니라 데이터 중심으로 정의하려는 흐름이 있습니다.

- 블루프린트 등록
- 블루프린트 팩토리
- 블루프린트 에디터
- 블루프린트 스포너

즉, “월드에 무엇을 배치할지”를 컴포넌트 조합과 데이터 정의로 다루려는 방향입니다.

## 주요 도메인 설명

### `src/core/motions`

캐릭터/엔티티 이동과 물리 상태를 다룹니다.

- 이동 입력 처리
- 방향/점프/힘 계산
- 물리 시스템 연동
- 엔티티 상태 업데이트

### `src/core/camera`

다양한 카메라 모드를 제공합니다.

- third person
- first person
- chase
- top down
- fixed
- isometric
- side scroll

### `src/core/interactions`

월드 상호작용과 입력 시스템을 담당합니다.

- 클릭 이동
- 상호작용 대상 탐색
- 포커스
- 프롬프트
- 자동화 이벤트 일부

### `src/core/building`

건설/배치 시스템입니다.

- 타일
- 벽
- 오브젝트 배치
- 빌딩 UI
- 미리보기 렌더러

### `src/core/networks`

멀티플레이어 및 방문 관련 기능입니다.

- 연결/동기화
- 네트워크 상태 store
- 플레이어 추적
- 메시지 큐
- 방문 스냅샷 직렬화

### `src/core/life-sim 계열`

생활형 게임 루프에 가까운 도메인들이 이미 들어와 있습니다.

- `items`
- `inventory`
- `economy`
- `dialog`
- `quests`
- `mail`
- `catalog`
- `crafting`
- `farming`
- `weather`
- `events`
- `town`
- `character`

이 부분이 Gaesup World를 단순 이동 라이브러리보다 훨씬 큰 프로젝트로 만드는 핵심입니다.

## 공개 API 상태

현재 기준으로 외부 사용자는 런타임/도메인 API는 루트 엔트리 `gaesup-world`에서 import 하고, 관리자와 편집기처럼 무거운 UI는 subpath를 사용합니다.

예:

```tsx
import {
  GaesupWorld,
  GaesupController,
  useInventoryStore,
  useGameTime,
} from 'gaesup-world';

import { GaesupAdmin, useAuthStore } from 'gaesup-world/admin';
import { BlueprintEditor } from 'gaesup-world/blueprints/editor';
```

최근 정리 방향도 `examples/`가 내부 파일 경로 대신 public API만 보도록 맞추는 쪽입니다.

## Admin 현재 정책

관리자 컴포넌트 `GaesupAdmin`은 현재 기본적으로 로그인 보호가 켜져 있습니다.

- 기본값: `requireLogin = true`
- 보호 해제 필요 시: 명시적으로 `requireLogin={false}`

즉, “관리자 시스템”이라는 이름에 맞게 기본 동작이 더 안전한 쪽으로 조정된 상태입니다.

## WorldContainer 관련 정리

이전에는 `WorldContainer`라는 이름이 실제 동작보다 더 큰 역할처럼 보일 수 있었습니다. 현재는 의미를 더 분명하게 하기 위해 `WorldConfigProvider`라는 이름도 함께 노출합니다.

- `WorldConfigProvider`: 설정을 store에 반영하는 의미가 더 분명한 이름
- `WorldContainer`: 하위 호환 alias
- `GaesupWorld`: 외부 사용자용 대표 API

## 데모 앱 역할

`examples/`는 단순 샘플이 아니라 사실상 통합 검증 환경에 가깝습니다.

- 쇼케이스 데모
- 월드/건설 에디터 데모
- 블루프린트 에디터
- 네트워크 멀티플레이어
- 관리자 래핑

새 기능이 추가될 때 실제 조합을 빠르게 확인하는 공간 역할도 합니다.

## 검증 상태

최근 확인 기준:

- 데모 Vite 빌드 성공
- 라이브러리 ESM 빌드 성공
- Jest 테스트 통과
- TypeScript declaration build 통과

즉, 런타임/번들/타입 선언 빌드 기준으로는 사용 가능한 수준입니다.

## 현재 리스크

### 1. 공개 API와 문서 정합성

도메인이 많고 subpath export가 분리되어 있어 문서가 실제 공개 API보다 앞서거나 뒤처질 수 있습니다. 특히 루트 import와 subpath import를 구분해야 합니다.

### 2. 번들 크기

데모 빌드는 성공하지만 메인 청크가 큽니다. 추후 동적 import와 청크 분할 전략이 필요합니다.

### 3. 저장/런타임 통합 경로

새 기능은 `SaveSystem` 기반 runtime path를 우선 사용합니다. `SaveSystem`은 중복 domain key 등록을 막고, serialize/hydrate 실패를 diagnostics로 보고합니다. `SaveLoadManager`는 legacy world save와 파일 import/export helper 역할로 남아 있으며, compressed legacy save도 목록 조회와 로드를 같은 포맷으로 처리합니다.

## 추천 읽기 순서

처음 보는 사람에게는 아래 순서를 권장합니다.

1. `README.md`
2. `examples/App.tsx`
3. `src/index.ts`
4. `src/core/index.ts`
5. 필요한 도메인 문서 하나씩

특정 기능을 보려면 다음 문서를 이어서 보면 좋습니다.

- 이동/조작: `docs/domain/MOTIONS.md`
- 블루프린트: `docs/domain/BLUEPRINT.md`
- 카메라: `docs/domain/CAMERA.md`

## 요약

Gaesup World는 “웹 3D 캐릭터 조작 라이브러리”에서 출발했지만, 현재는 생활형 월드 게임 제작을 위한 확장형 프레임워크에 가까운 형태로 성장한 상태입니다. 구조는 크고 복잡하지만, 도메인 분리와 bridge/plugin 패턴 덕분에 확장성은 좋은 편입니다. 앞으로의 핵심 과제는 공개 API 문서 정합성 유지, 저장 경로 통합, 번들 최적화입니다.
