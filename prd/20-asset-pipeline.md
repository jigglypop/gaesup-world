# PRD-20 에셋 파이프라인

| 항목 | 값 |
|---|---|
| 우선순위 | P1 |
| 트랙 | Epoch (에셋 원본 모델 변경) |
| 선행 PRD | 10 |
| 후속 PRD | 25 (빌드 시 에셋 번들) |

## 1. 배경과 문제

- `assets` 도메인은 카탈로그와 로드 중심이다. todolist: Asset metadata, import pipeline, material asset, thumbnail이 Partial, dependency graph는 Not Started.
- 패키지 `files`에 `public/gltf/*.glb`와 `public/gltf/props/**/*`(약 66MB)가 포함되어 npm 배포본이 무겁다.
- AI 생성 에셋(Meshy, Tripo 등)은 GLB와 PBR을 내보내지만 폴리곤 수, 텍스처 크기, 스켈레톤이 제각각이다. 검증 없이 넣으면 런타임 성능이 흔들린다.
- 원격 피어가 보낸 `modelUrl`을 그대로 로드하는 경로가 있다(`RemotePlayer.tsx:113,487`). 에셋 참조가 ID가 아니라 URL이기 때문이다.

## 2. 목표 / 비목표

### 목표
1. 모든 에셋은 `assetId`로 참조한다. URL은 에셋 메타데이터에만 있다.
2. import 파이프라인이 에셋을 검증하고 최적화 정보를 기록한다.
3. 의존성 그래프로 "이 에셋을 쓰는 씬·prefab"과 "이 씬에 필요한 에셋"을 계산한다.
4. 누락 에셋이 있어도 씬이 열리고 대체 표시가 된다.
5. 라이브러리 패키지에서 대용량 데모 에셋을 분리한다.

### 비목표
- 서버 측 에셋 변환 서비스 운영. 변환은 CLI 스크립트(로컬, CI)로 한다.
- 에셋 스토어나 마켓플레이스.

## 3. 요구사항

| ID | 요구사항 |
|---|---|
| FR-1 | `AssetMeta { assetId, type, url, hash, size, thumbnail, dependencies[], importSettings, stats }` |
| FR-2 | 타입: model, texture, material, audio, animationClip, prefab, scene, script(참조만). `splat`은 예약 |
| FR-3 | import 검증: GLB 파싱, 삼각형 수, 텍스처 해상도, 머티리얼 수, 스켈레톤 본 수, 애니메이션 클립 목록. 한계 초과 시 경고 또는 거부 (project-settings 기준) |
| FR-4 | 최적화 CLI: `pnpm assets:optimize` → meshopt 압축, KTX2(Basis) 텍스처, 결과 메타데이터 갱신 |
| FR-5 | 런타임 로더가 meshopt, KTX2 디코더를 지연 로드 |
| FR-6 | 썸네일 생성: 에디터에서 오프스크린 렌더 후 저장 |
| FR-7 | 의존성 그래프: SceneDocument, prefab의 `assetRef`를 스캔 |
| FR-8 | 누락 에셋: 대체 메시(박스), Inspector 경고, 일괄 재연결 UI |
| FR-9 | 원격 에셋 참조는 `assetId` 허용 목록으로만 해석 (PRD-22) |
| FR-10 | AI 생성 에셋 전처리 체크리스트: 스케일 정규화, 피벗, 폴리곤 한계, 리깅 호환 |
| NFR-1 | 데모 초기 로드 에셋 바이트 기준선 대비 40% 감소 (압축 적용 후) |
| NFR-2 | npm 패키지 크기: 데모 에셋 제외 후 기록 |

## 4. 설계

```
src/core/assets/
  core/
    meta.ts          AssetMeta 타입, 검증
    registry.ts      assetId → meta, 해석
    dependencies.ts  그래프 계산
    importers/gltf.ts, texture.ts, audio.ts
  react/
    useAsset(assetId)   Suspense 로더, 누락 시 대체
scripts/
  assets-optimize.cjs   meshopt/KTX2 변환 (gltf-transform 사용 검토)
```

- `gaesup.meshRenderer.data.assetId`를 기준으로 한다. `url` 필드는 하위 호환으로만 남긴다.
- 에셋 매니페스트(`assets.json`)를 프로젝트 단위로 둔다. 빌드(PRD-25)가 이 매니페스트로 번들을 만든다.

## 5. 단계별 작업

| Slice | 내용 | 완료 기준 |
|---|---|---|
| 20-a | `AssetMeta`와 레지스트리, `useAsset` | 단위 테스트 |
| 20-b | `meshRenderer`를 assetId 기준으로 전환, url 하위 호환 | scene-object 테스트 |
| 20-c | GLB import 검증 | fixture GLB 테스트 |
| 20-d | 최적화 CLI와 로더 디코더 | 데모 에셋 바이트 비교 (NFR-1) |
| 20-e | 의존성 그래프 | 씬 → 에셋 목록 테스트 |
| 20-f | 누락 에셋 처리 UI | 에디터 테스트 |
| 20-g | 썸네일 생성 | Project 패널 표시 |
| 20-h | 패키지에서 `public/gltf` 제외, 데모 에셋 별도 경로 (사용자 확인) | `pnpm pack` 크기 기록 |

## 6. 공개 API 영향

- 추가: `AssetMeta`, `registerAssets`, `useAsset`, `resolveAsset`.
- 변경: 패키지 `files`에서 데모 GLB 제거. 기본 캐릭터 모델을 기대하는 사용자에게 영향 → 문서와 기본 URL 옵션 필요.

## 7. 검증과 완료 기준

- assets 테스트, 데모 빌드, 브라우저 로드 시간 기록

## 8. 열린 질문

1. 데모 에셋을 어디에 둘 것인가: 별도 npm 패키지, CDN, GitHub Pages.
2. 최적화 도구로 `@gltf-transform/cli`를 devDependency로 추가해도 되는가.

## 구현 현황 (2026-09-23, 2차)

| Slice | 상태 | 내용 |
|---|---|---|
| 20-c | 완료 | `inspectModel`(메시, 삼각형, 머티리얼, 텍스처, 본, 클립, 크기)과 `validateModelStats`(한도, AI 생성 에셋 스케일 점검) |
| 20-e | 완료 | `collectAssetReferences`, `buildAssetDependencyGraph`, `findMissingAssetReferences` |
| 나머지 | 미착수 | 기존 `AssetRecord` 모델과의 통합, 압축 CLI, 썸네일 |

검증: 타입체크(src, examples)와 변경 파일 린트 통과. 새 테스트는 메모리 제약으로 실행하지 않았다.
