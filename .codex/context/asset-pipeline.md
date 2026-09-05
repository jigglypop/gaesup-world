# Asset Pipeline

## 목표 흐름

```text
.blend -> Blender export -> GLB -> validation -> manifest -> runtime catalog -> streaming and projection
```

## 목표 asset 모델

asset record는 `assetId`, `version`, `kind`, `source`, `bounds`, `lods`, `colliders`, `sockets`, `roomVolumes`, `interactionAnchors`, `materials`, `tags`로 확장 가능해야 한다.

## 규칙

- Asset ID는 안정적이며 URL과 독립적이다.
- runtime 동작은 mesh 이름에서 의미를 추론하지 않는다.
- Blender custom property는 명시적으로 검증된 manifest 데이터로 변환한다.
- collider, socket, room, LOD, interaction 메타데이터는 engine-neutral이다.
- Meshopt와 KTX2는 파이프라인의 capability이지 도메인 상태에 박아 넣는 가정이 아니다.

현재의 `src/core/assets` catalog과 공개 assets entry가 출발점이다. schema는 slice 단위로 확장하고 기존 소비자 호환을 유지한다.
