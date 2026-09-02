# Blender 캐릭터 파츠 파이프라인

`pnpm assets:parts`는 로컬 Blender를 headless로 실행해 `public/gltf/ally_body.glb`의 armature를 공유하는
파츠 GLB와 manifest를 생성하고, Node 쪽에서 rig 호환성을 검증한다. 생성물은 저장소에 커밋하므로
Blender가 없는 환경에서도 데모와 guard 테스트는 그대로 동작한다.

```text
ally_body.glb -> Blender(bpy) 파츠 생성/export -> public/gltf/parts/*.glb + manifest.json
             -> Node 검증(joints, bindPoseHash) -> seedAssets.ts 등록 -> CharacterMenu 장착
```

## 실행

```bash
pnpm assets:parts            # 생성 + 검증
node scripts/build-character-parts.cjs --inspect   # armature 본/메시/영역 분류만 출력
```

Blender 경로는 `GAESUP_BLENDER` 환경 변수로 지정하거나, Windows 기본 설치 경로에서 최신 버전을 자동으로 찾는다.
검증은 Blender 5.1 기준이다.

## 생성 규칙

- 모든 파츠는 body armature 전체를 함께 export한다. body와 joint 순서가 같으면 `identical`, 이름만 같고
  순서가 다르면 `remappable`로 기록되며 런타임 `resolveSharedSkeletonBinding`이 그대로 처리한다.
- `bottom`/`shoes`: 다리 본이 지배하는 body 정점을 높이로 나눠 복제하고 법선 방향으로 띄운 shell이다.
  발 경계선은 몸체 높이의 7% 지점이다. 현재 rig에는 발 본이 없어 이름 기반 분류를 쓰지 않는다.
- `weapon`: 절차 생성 검을 오른팔 체인 말단 본의 tail에 두고 그 본에 100% 웨이트를 준 SkinnedMesh다.
  rigid 소켓 런타임이 없어도 공유 스켈레톤 경로로 팔을 따라간다.
- 치수 상수는 미터 기준이며 몸체 높이를 1.7m로 보고 armature 단위로 환산한다.

## manifest

`public/gltf/parts/manifest.json`은 body 본 목록, 오른팔 말단 본, 발 경계선, 파츠별 `url`/`slot`/`kind`/
`deformation`/사용 본/bounds/`compatibility`/`bindPoseHash`를 기록한다. `src/core/assets/__tests__/characterPartsManifest.test.ts`가
manifest와 `seedAssets.ts`의 정합성을 고정한다.

## 한계

- 생성물은 프로그래머 아트다. 실제 의상은 Meshy나 모델링 결과를 같은 armature로 export해 이 경로에 태운다.
- `hideBodyRegions`는 body 노드가 `BODY_REGIONS` 이름을 써야 동작하므로 이번 파츠에는 넣지 않았다.
- 본 소켓 부착 런타임과 NPC 파츠 통합은 별도 slice다.
