using UnityEngine;

namespace Gaesup.World
{
    // Preserves engine-neutral metadata without attempting to run TypeScript components.
    public sealed class GaesupSceneObject : MonoBehaviour
    {
        public string objectId;
        [TextArea] public string componentsJson = "[]";
        public string[] sceneTags = new string[0];
        public string sceneLayer = "";
    }
}
