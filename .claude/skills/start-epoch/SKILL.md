---
name: start-epoch
description: architecture boundary나 source of truth를 바꾸는 epoch 작업을 시작할 때만 로드. 일상 작업(fast track)은 plan 없이 바로 구현한다.
---

# Start Epoch

먼저 판단: 이 작업이 architecture boundary·public API 계약·source of truth를 바꾸는가? 아니면 이 스킬을 쓰지 말고 바로 구현한다(`.codex/context/engineering.md`의 fast track).

epoch 작업이 맞으면:

1. `.codex/plans/active/`를 확인한다. 관련 plan이 있으면 그것을 따르고, 없으면 `.codex/plans/TEMPLATE.md`(3섹션)를 채워 `active/epoch-<N>-<slice>.md`를 만든다. epoch 번호와 결합 금지 규칙은 `.codex/context/migration.md`.
2. 해당 영역 context만 로드한다: 공통 `invariants.md` + `engineering.md`, 영역별로 `architecture/world-model`(구조·API), `r3f10-webgpu/performance`(렌더링·성능), `asset-pipeline/networking`(asset·network·save) 중 하나.
3. 구현한다. strangler: 가장 작은 boundary 하나만 이동, old/new 공존 시 canonical path 명시. 검증·완료 처리는 `/close-epoch`.
