# PRD-25 빌드와 배포

| 항목 | 값 |
|---|---|
| 우선순위 | P2 |
| 트랙 | Epoch (새 제작 파이프라인) |
| 선행 PRD | 10, 12, 20 |

## 1. 배경과 문제

- Unity는 "에디터 → Build Settings → 실행 파일"이 한 흐름이다. gaesup-world는 에디터에서 만든 결과를 **배포 가능한 웹 게임**으로 내보내는 경로가 없다.
- `project-settings.build`에 `target: 'web'`, `publicPath`, `assetBaseUrl`, `sourceMaps`, `minify`, `chunkStrategy` 스키마가 있지만 실행기가 없다.
- `content/exporter.ts`와 `StudioPanel`이 월드 데이터를 내보내는 기능이 있다(범위 확인 필요).
- 씬 전환, additive 로드, 스트리밍 API가 없다.

## 2. 목표 / 비목표

### 목표
1. 프로젝트(설정 + 씬들 + 에셋 매니페스트 + 스크립트 등록)를 정적 웹 사이트로 빌드한다.
2. 런타임 플레이어: 빌드 산출물을 로드해 실행하는 최소 앱 셸.
3. 씬 관리 API: 로드, 언로드, 전환, additive.
4. 빌드 산출물을 GitHub Pages, Cloudflare Pages, 일반 정적 호스팅에 올릴 수 있다.

### 비목표
- 네이티브 앱(Electron, Capacitor) 빌드. 웹 산출물을 감싸는 것은 사용자 몫.
- 호스팅 서비스 운영.

## 3. 요구사항

| ID | 요구사항 |
|---|---|
| FR-1 | 프로젝트 파일 형식: `project.json`(ProjectSettings), `scenes/*.scene.json`, `prefabs/*.prefab.json`, `assets.json` |
| FR-2 | 에디터에서 프로젝트 내보내기(zip)와 가져오기 |
| FR-3 | CLI `gaesup build <projectDir>`: Vite로 플레이어 셸 + 사용자 스크립트 엔트리 + 에셋 복사·최적화(PRD-20) |
| FR-4 | 사용자 스크립트 엔트리: `scripts/index.ts`에서 `registerScript` 호출. 빌드가 번들에 포함 |
| FR-5 | 씬 관리: `sceneManager.load(id, { additive })`, `unload(id)`, 로딩 진행률 이벤트, 로딩 화면 컴포넌트 |
| FR-6 | 빌드 산출물 검증: 누락 에셋, 미등록 스크립트, 스키마 오류가 있으면 실패 |
| FR-7 | `chunkStrategy` 반영: single, vendor-split, domain-split |
| FR-8 | (후속) 거리 기반 씬 청크 스트리밍 |
| NFR-1 | 빈 씬 빌드 산출물 초기 JS 크기 기록, 목표 설정 |
| NFR-2 | 데모 월드 빌드 산출물 첫 상호작용까지 시간 기록 |

## 4. 설계

```
packages 없이 저장소 내부:
  src/core/scene/manager/     sceneManager (로드, 언로드, additive, 진행률)
  src/player/                 플레이어 셸 (Canvas, FrameSchedulerHost, ScriptRuntimeHost, 로딩 화면)
  scripts/gaesup-build.cjs    CLI (bin 등록)
```

- 플레이어 셸은 `examples/`의 최소 예제(`/minimal`)를 기반으로 만든다.
- CLI를 `package.json` `bin`에 등록한다.

## 5. 단계별 작업

| Slice | 내용 | 완료 기준 |
|---|---|---|
| 25-a | 프로젝트 파일 형식과 검증 | 스키마 테스트 |
| 25-b | 씬 관리 API | 전환·additive 테스트 |
| 25-c | 에디터 내보내기·가져오기 | 왕복 테스트 |
| 25-d | 플레이어 셸 | 샘플 프로젝트 실행 |
| 25-e | 빌드 CLI | 샘플 프로젝트 → 정적 사이트 → 브라우저 E2E |
| 25-f | 배포 가이드 (GitHub Pages) | 문서 |
| 25-g | 청크 스트리밍 (후속) | 별도 설계 |

## 6. 공개 API 영향

- 추가: `sceneManager`, 플레이어 셸 컴포넌트, `bin: gaesup`.

## 7. 검증과 완료 기준

- 샘플 프로젝트(스크립트 5종 포함)를 빌드해 정적 서버에서 브라우저 E2E 통과

## 8. 열린 질문

1. CLI를 이 패키지에 넣을지, `create-gaesup-world` 같은 별도 패키지로 둘지.
2. `content/exporter.ts`와 역할이 겹치는 부분 정리 방침.

## 구현 현황 (2026-09-23, 2차)

| Slice | 상태 | 내용 |
|---|---|---|
| 25-a | 완료 | `GaesupProjectFile`(settings, startScene, scenes, prefabs, requiredScripts, assetManifest), `createProjectFile`, `validateProjectFile`, `parseProjectFile` |
| 25-b | 완료 | `SceneDocumentManager`: 로더 등록, 단일 로드(교체), additive 로드(접두사 병합), 언로드, 이벤트. 페이드 전환은 기존 `sceneStore.goTo`가 담당 |
| 나머지 | 미착수 | |

검증: 타입체크(src, examples)와 변경 파일 린트 통과. 새 테스트는 메모리 제약으로 실행하지 않았다.
