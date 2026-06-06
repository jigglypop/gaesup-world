# Meshy 캐릭터 에셋 제작 가이드

이 프로젝트의 캐릭터 커스터마이징은 `src/` 내부 파일을 직접 가져오는 방식이 아니라,
공개 에셋 카탈로그에 등록된 `AssetRecord`를 통해 소비한다. Meshy에서 만든 결과물은
공개 GLB 파일로 넣고, 각 파츠를 카탈로그에 등록해서 예제 화면에서 바로 장착할 수
있게 만든다.

## 권장 출력 형태

- 웹/R3F 런타임에서는 `.glb`를 우선 사용한다.
- 리깅이나 애니메이션을 Blender에서 점검하거나 보정해야 하면 `.fbx`를 중간 작업용으로
  보관하고, 최종 런타임 파일은 `.glb`로 만든다.
- 기본 몸체 하나와 교체용 파츠를 나눠서 준비한다. 현재 지원 슬롯은 `top`, `bottom`,
  `shoes`, `hat`, `glasses`, `weapon`, `accessory`다.
- 모든 착용 파츠는 기본 몸체와 같은 원점, 같은 스케일, 같은 앞 방향을 기준으로 맞춘다.
- 생성/리깅 프롬프트는 A-pose 또는 T-pose가 안정적이다. 긴 망토, 헐렁한 천, 떠 있는
  끈 장식은 자동 리깅에서 깨지기 쉬우므로 Blender 보정 전제로만 쓴다.
- 애니메이션 클립이 포함된 모델은 이름을 `idle`, `walk`, `run`, `jump`, `ride_idle`,
  `attack`처럼 예측 가능하게 맞춘다.

## 카탈로그 등록 예시

Meshy에서 만든 파츠는 공개 에셋 카탈로그에 이렇게 등록한다.

```ts
{
  id: 'meshy-round-glasses',
  name: 'Round Glasses',
  kind: 'characterPart',
  slot: 'glasses',
  url: 'gltf/characters/round_glasses.glb',
  tags: ['meshy', 'glasses'],
  metadata: {
    source: 'Meshy',
    attachment: {
      socket: 'face',
      position: [0, -0.08, 0.32],
      rotation: [0, 0, 0],
      scale: [1, 1, 1]
    }
  }
}
```

몸체 일부를 실제로 교체하는 파츠는 해당 부위 슬롯을 `slot`에 넣는다. 예를 들어 상의는
`top`, 바지는 `bottom`, 신발은 `shoes`다. 손에 들거나 얼굴에 붙는 소품처럼 스킨 메시를
교체하기보다 특정 위치에 붙이는 에셋은 `metadata.attachment`를 함께 넣는다.

## Blender 반입 전 체크리스트

- transform을 적용하고 `public/gltf/ally_body.glb`와 스케일을 비교한다.
- 메시 원점이 안정적인지, 월드 원점에서 기본 캐릭터에 정확히 맞는지 확인한다.
- 불필요한 카메라, 라이트, empty 오브젝트를 제거한다.
- 텍스처는 GLB에 포함하거나 안정적인 상대 경로로 둔다.
- Meshy 결과물이 너무 고밀도면 배포 전에 폴리곤을 줄인다. 착용 파츠는 hero prop보다
  훨씬 가벼워야 한다.
- 지원 기능으로 보기 전에 예제의 Character Creator에서 실제 장착 테스트를 한다.

## Meshy에서 가져올 때의 판단

- 정적 소품, 옷, 안경, 신발 같은 런타임 파츠는 GLB 우선.
- 리깅이 필요한 캐릭터 원본이나 애니메이션 세트는 FBX로 받아 Blender에서 확인한 뒤
  GLB로 다시 내보내는 흐름이 안전하다.
- Meshy가 자동 리깅한 결과는 바로 신뢰하지 말고 어깨, 손목, 무릎, 신발 밑면,
  얼굴 부착물 위치를 먼저 확인한다.
- 애니메이션 중 옷/안경/바지/신발/무기를 바꿀 계획이면, 파츠별 GLB가 같은 기준 포즈와
  같은 기준 스케일을 공유해야 한다. 그래야 `resolveCharacterParts`와 attachment socket이
  흔들리지 않는다.

## 확인한 공식 정보

- Meshy Help Center 기준으로 GLB, FBX, OBJ, USDZ, STL, BLEND export를 지원한다.
- Meshy animation 기능은 애니메이션이 포함된 FBX/GLB export를 안내한다.
- Meshy rigging API는 rigged character FBX와 animation GLB 결과 URL을 제공한다.
