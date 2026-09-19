# Unity와 연결하기

[English](unity.en.md) · [미니홈피](minihome.md)

두 가지 경로가 있습니다. **GLB는 보이는 3D 모양**, **장면 JSON은 계층과 편집 가능한 데이터**를 전달합니다. 같은 기능으로 혼동하지 마세요.

## GLB로 모양 가져오기

미니홈피에서 **3D 방 내보내기 (.glb)**를 누릅니다. Unity 프로젝트에 호환 glTF importer를 설치하고 파일을 가져옵니다. Unity의 [glTFast 공식 문서](https://docs.unity3d.com/Packages/com.unity.cloud.gltfast@6.0/manual/index.html)를 참고하세요.

geometry, material, 정적 transform을 내보냅니다. 게임 로직, 물리 collider, NPC 동작과 프로필·글은 포함하지 않습니다. 렌더러가 다르므로 조명과 색은 완전히 같지 않을 수 있습니다.

## 장면 JSON 왕복

1. 이 저장소의 `integrations/unity` 폴더를 Unity 프로젝트의 `Assets/GaesupWorld` 아래에 복사합니다. Editor/Runtime 구조를 유지하세요.
2. 미니홈피의 **Unity 장면 JSON**을 내려받거나 아래 API로 생성합니다.
3. Unity의 **Tools → Gaesup World → Import Scene JSON**에서 파일을 선택합니다.
4. 생성된 컨테이너 아래의 object를 편집합니다. 컨테이너를 선택하고 **Export Selected Children as Scene JSON**으로 내보냅니다.
5. 웹에서 `importUnityScene`으로 읽은 SceneDocument를 document controller의 `scene-document.replace`에 전달합니다. 일반 Unity JSON은 미니홈피 백업과 다른 형식이며 미니홈피 백업 가져오기로 바로 열지 않습니다.

```ts
import { exportUnityScene, importUnityScene } from 'gaesup-world';

const unityJson = JSON.stringify(exportUnityScene(controller.getSnapshot()), null, 2);
const document = importUnityScene(unityJson);
controller.dispatch({ type: 'scene-document.replace', document });
```

계층·이름·ID·로컬 위치/회전/크기와 component JSON, tag, layer 메타데이터를 보존합니다. Unity의 컨테이너 자체 transform은 export하지 않으며 자식을 컨테이너 기준으로 내보냅니다. tag/layer는 Unity의 전역 TagManager에 자동 등록하지 않고 메타데이터로 유지합니다.

Unity import는 빈 GameObject 계층을 만듭니다. component JSON을 Unity MonoBehaviour나 mesh로 자동 실행·생성하지 않습니다. 시각 모델은 GLB 경로로 별도 가져옵니다.

## 좌표 규약과 검증

SceneDocument는 미터 단위, 오른손 좌표, XYZ Euler 라디안입니다. Unity bridge JSON은 미터 단위, 왼손 좌표, quaternion `[x,y,z,w]`입니다. 위치는 `[x,y,-z]`, quaternion은 `[-x,-y,z,w]`로 변환합니다. local transform을 전달하므로 비균일 scale이 있는 부모 계층을 유지합니다.

Unity가 왼손 좌표와 quaternion을 사용하는 근거는 [Unity 공식 문서](https://docs.unity.com/en-us/engine/6000.6/manual/scripting/programming-math/unity-engine-math/class-quaternion)입니다.

TypeScript 왕복과 행렬 비교, 잘못된 계층·quaternion 거부, 브라우저 GLB 생성/검증을 확인합니다. 이 작업 환경에서는 Unity Editor가 없어 C# 컴파일과 실제 Editor 왕복은 아직 검증하지 못했습니다. 네이티브 `.unity`/prefab 직접 변환, C#↔TypeScript 실행, shader/Animator/physics 자동 호환은 제공하지 않습니다.
