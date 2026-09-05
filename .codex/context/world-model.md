# World Model

## 목표 계약

```text
WorldDocument
  schemaVersion
  entities: WorldEntity[]
  prefabs: PrefabReference[]
  metadata

WorldEntity
  id: EntityId
  components: ComponentData

WorldCommand -> canonical mutation
WorldEvent -> accepted mutation result
Query -> derived read model
Migration -> schema upgrade
```

계약은 engine-neutral serializable 데이터를 사용해야 한다. Three.js 객체, Rapier handle, React ref, DOM node, store 인스턴스를 포함하지 않는다.

`SceneJsonObject`는 기존의 strict JSON read 계약을 유지하며 `undefined`를 포함하지 않는다. 표준 component data interface는 별도 `SceneJsonAuthoringObject`를 확장해 TypeScript의 두 exact-optional 모드에서 같은 authoring input을 받는다. canonical write path인 `createSceneComponent`는 입력을 plain owned data로 복사하면서 `undefined`, symbol key, accessor, custom array prototype, non-plain object, non-finite number, negative zero, cycle과 sparse array를 거부한다. 반환 데이터는 입력과 alias되지 않지만 기존 mutable API는 유지하므로 직접 변경은 canonical mutation이 아니며 document validation/load/serialize가 다시 검사한다. persisted parser는 authoring factory의 자동 ID 생성을 사용하지 않고 object/component ID와 component dispatch type을 필수 stable string으로 검증한다. load는 owned document를 projection하고, serialize는 모든 validation issue를 거부한 뒤 owned plain document를 다시 materialize해 저장한다.

## 현재 갭

world, editor, building, 도메인 store들이 각자 유용한 상태를 소유하지만 이를 조율하는 versioned document가 없다. WorldDocument 도입은 모든 store 교체가 아니라 좁은 persistent 도메인과 adapter에서 시작해야 한다.

## 첫 권장 slice

작은 scene-object 또는 prefab 부분집합을 대상으로 document와 command 타입을 정의하고, 기존 storage를 adapt하고, editor/runtime projection과 save round-trip을 증명한다. building 통합은 canonical write path가 측정·테스트된 뒤에만 진행한다.
