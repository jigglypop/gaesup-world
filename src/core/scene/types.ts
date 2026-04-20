export type SceneId = string;

export type SceneEntry = {
  /** World-space spawn position (x,y,z) used after a scene swap. */
  position: [number, number, number];
  /** Yaw angle (radians) used after a scene swap. */
  rotationY?: number;
};

export type SceneDescriptor = {
  id: SceneId;
  /** Human readable label for HUDs/debug. */
  name?: string;
  /** Whether this is an interior; toggles default fog/lighting hints. */
  interior?: boolean;
  /**
   * Where to drop the player when entering this scene. When omitted, the
   * player keeps its previous position (used by overlay scenes).
   */
  entry?: SceneEntry;
  /**
   * Optional return point. When the player leaves an interior, this is the
   * position they should be placed at outside (typically right in front of the
   * door). Falls back to the door's prevReturn.
   */
  exit?: SceneEntry;
};

export type SceneSerialized = {
  version: 1;
  current: SceneId;
};

export const DEFAULT_SCENE_ID: SceneId = 'outdoor';
