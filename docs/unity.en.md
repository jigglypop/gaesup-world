# Connect to Unity

[한국어](unity.md) · [Mini-home](minihome.en.md)

Use **GLB for visible geometry** and **scene JSON for hierarchy and editable data**.

## Import the visible room

Choose **3D 방 내보내기 (.glb)** in the mini-home. Install a compatible glTF importer in Unity and import the file. See [Unity glTFast documentation](https://docs.unity3d.com/Packages/com.unity.cloud.gltfast@6.0/manual/index.html).

The export includes geometry, materials and static transforms. It excludes gameplay, colliders, NPC behavior, profile and notes. Lighting and colors may differ between renderers.

## Exchange scene JSON

1. Copy this repository's `integrations/unity` into `Assets/GaesupWorld` in your Unity project. Keep the Editor/Runtime folders.
2. Download **Unity 장면 JSON** in the mini-home, or use the API below.
3. In Unity, choose **Tools → Gaesup World → Import Scene JSON**.
4. Edit the objects under the created container. Select the container and choose **Export Selected Children as Scene JSON**.
5. Read the result with `importUnityScene` and dispatch `scene-document.replace`. This interchange format is different from a mini-home backup and is not accepted by the mini-home backup picker.

```ts
import { exportUnityScene, importUnityScene } from 'gaesup-world';

const unityJson = JSON.stringify(exportUnityScene(controller.getSnapshot()), null, 2);
const document = importUnityScene(unityJson);
controller.dispatch({ type: 'scene-document.replace', document });
```

Hierarchy, names, IDs, local TRS, component JSON, tags and layer metadata are preserved. The selected container's transform is excluded; children are exported relative to it. Tags/layers remain metadata rather than modifying Unity's global TagManager.

The JSON importer creates empty GameObjects. It does not turn component JSON into MonoBehaviours or meshes. Bring visible models through the separate GLB path.

## Coordinates and verification

SceneDocument uses meters, a right-handed basis and XYZ Euler radians. Unity interchange uses meters, a left-handed basis and quaternion `[x,y,z,w]`. Position reflects to `[x,y,-z]`; quaternion reflects to `[-x,-y,z,w]`. Local transforms preserve parent hierarchies with nonuniform scale.

See [Unity's coordinate documentation](https://docs.unity.com/en-us/engine/6000.6/manual/scripting/programming-math/unity-engine-math/class-quaternion).

TypeScript round-trips, matrix equivalence, invalid hierarchy/quaternion rejection, browser GLB export and GLB validation are checked. Unity Editor was unavailable in this environment, so C# compilation and real Editor round-trips remain unverified. Native `.unity`/prefab conversion, C#↔TypeScript execution and automatic shader/Animator/physics equivalence are not supported.
