# Legacy 마이그레이션 상태 분석

## 개요
`src/legacy` 폴더의 기능들이 `src/core`와 `src/admin`으로 마이그레이션된 상태를 분석한 문서입니다.

## 마이그레이션 완료된 기능들 ✅

### 1. **Building System (건물/타일/벽)**
- **Legacy**: `components/hoverTile`, `containers/tileParent`, `containers/wallPrarent`
- **Core**: `src/core/building/*` 
- **상태**: 완전히 마이그레이션됨. 더 향상된 기능으로 구현됨
  - HoverTile → PreviewTile
  - Tile/Wall 시스템 전체가 BuildingSystem으로 통합
  - BuildingBridge를 통한 레거시 데이터 호환

### 2. **Portal/Teleport**
- **Legacy**: `containers/portal`, `components/portal`
- **Core**: `src/core/motions/components/Teleport`
- **상태**: teleport 기능으로 구현됨

### 3. **Animation System**
- **Legacy**: 개별 애니메이션 관리
- **Core**: `src/core/animation/*`
- **상태**: AnimationEngine, AnimationBridge로 고도화됨

### 4. **NPC System**
- **Legacy**: `common/npc`, `containers/npc`
- **Core**: `src/core/npc/*`
- **상태**: 기본 기능은 마이그레이션됨

### 5. **Camera System**
- **Legacy**: 기본 카메라 제어
- **Core**: `src/core/camera/*`
- **상태**: 다양한 카메라 모드와 컨트롤러로 확장됨

### 6. **Admin/Auth**
- **Legacy**: `api/auth.ts`, `components/auth`
- **Admin**: `src/admin/*`
- **상태**: 완전히 분리된 admin 모듈로 구현됨

## 마이그레이션 필요한 기능들 ❌

### 1. **Speech Balloon (말풍선)**
- **Legacy**: `common/spriteTag`, `store/speechBallon`
- **현재 상태**: Core에 없음
- **필요성**: 3D 공간에서 텍스트 표시는 중요한 UI 요소
- **제안**: `src/core/ui/components/SpeechBalloon`으로 구현

### 2. **Color Picker**
- **Legacy**: `common/smallColorPicker`
- **현재 상태**: Core에 없음
- **필요성**: 오브젝트 색상 커스터마이징에 필요
- **제안**: `src/core/ui/components/ColorPicker`로 구현

### 3. **Modal System**
- **Legacy**: `components/modals/*` (saveRoom, write, message, info 등)
- **현재 상태**: Core에 체계적인 모달 시스템 없음
- **필요성**: 사용자 입력, 정보 표시 등에 필수
- **제안**: `src/core/ui/components/Modal` 시스템 구축

### 4. **Save/Load System**
- **Legacy**: `api/save.ts`, `components/modals/saveRoom`
- **현재 상태**: 부분적으로만 구현됨
- **필요성**: 월드 상태 저장/불러오기 필수
- **제안**: `src/core/world/persistence` 모듈로 구현

### 5. **Progress/Loading UI**
- **Legacy**: `common/progress`, `components/loading`
- **현재 상태**: Core에 통합된 로딩 시스템 없음
- **필요성**: 사용자 경험 향상
- **제안**: `src/core/ui/components/Progress`로 구현

### 6. **Toast Notifications**
- **Legacy**: `components/toast`, `store/toast`
- **현재 상태**: Admin에만 있고 Core에는 없음
- **필요성**: 사용자 피드백 제공
- **제안**: `src/core/ui/components/Toast`로 구현

### 7. **Slider Components**
- **Legacy**: `common/sliderWrapper`, `common/toggleSlider`
- **현재 상태**: Core에 없음
- **필요성**: 설정값 조정 UI
- **제안**: `src/core/ui/components/Slider`로 구현

### 8. **Environment Update System**
- **Legacy**: `components/updateEnvironment`, `containers/updateRoom`
- **현재 상태**: 부분적으로만 구현됨
- **필요성**: 실시간 환경 편집
- **제안**: `src/core/world/environment` 확장

### 9. **Zoom Bar**
- **Legacy**: `components/zoomBar`
- **현재 상태**: 카메라 시스템에 통합되지 않음
- **필요성**: 직관적인 줌 컨트롤
- **제안**: `src/core/camera/components/ZoomControl`로 구현

### 10. **Preview System**
- **Legacy**: `components/preview` (다양한 프리뷰 컴포넌트들)
- **현재 상태**: Building에만 부분적으로 구현
- **필요성**: 오브젝트 배치 전 미리보기
- **제안**: 각 도메인별 Preview 컴포넌트 확장

## 부분적으로 마이그레이션된 기능들 ⚠️

### 1. **Three Object Management**
- **Legacy**: `common/threeObject`, `containers/threeObject`
- **현재 상태**: Building 시스템에 일부 통합
- **추가 필요**: 범용 3D 오브젝트 관리 시스템

### 2. **File Loader**
- **Legacy**: `common/fileLoader`
- **현재 상태**: 각 도메인에 분산됨
- **추가 필요**: 통합 파일 로딩 시스템

### 3. **Focus System**
- **Legacy**: `common/focus`
- **현재 상태**: 카메라 시스템에 일부 통합
- **추가 필요**: 오브젝트 포커스 기능 강화

## 제거 가능한 기능들 🗑️

### 1. **Board Container**
- **Legacy**: `containers/board`
- **상태**: 빈 컴포넌트, 사용되지 않음

### 2. **Ocean Component** 
- **Legacy**: Ocean 관련 코드
- **상태**: 주석 처리됨, 사용되지 않음

## 마이그레이션 우선순위

### 높음 (핵심 기능)
1. Speech Balloon System
2. Modal System
3. Save/Load System
4. Toast Notifications

### 중간 (사용자 경험)
5. Color Picker
6. Progress/Loading UI
7. Slider Components
8. Zoom Bar

### 낮음 (부가 기능)
9. Environment Update System
10. Preview System 확장

## 기술적 고려사항

### 1. **의존성 관리**
- `react-color` (Color Picker) → 경량 대체 라이브러리 검토
- Legacy의 `jotai` 사용 → Core의 `zustand`로 통합

### 2. **스타일 시스템**
- Legacy: `.css.ts` (vanilla-extract)
- Core: `.css` (일반 CSS + CSS 변수)
- 일관성 있는 스타일 시스템으로 통합 필요

### 3. **Bridge 패턴 활용**
- 각 도메인별 Bridge 클래스를 통한 점진적 마이그레이션
- Legacy 데이터 구조와의 호환성 유지

### 4. **테스트 전략**
- 마이그레이션된 기능에 대한 단위 테스트 작성
- Legacy와의 기능 동등성 검증

## 결론

전체적으로 핵심 3D 기능들(Building, Animation, Motion, Camera)은 잘 마이그레이션되었으나, UI/UX 관련 기능들(Speech Balloon, Modal, Toast, Color Picker 등)과 데이터 관리 기능(Save/Load)이 누락되어 있습니다. 

이러한 기능들은 사용자 경험에 직접적인 영향을 미치므로, 블루프린트 시스템 구현 전에 우선적으로 마이그레이션하는 것이 권장됩니다. 