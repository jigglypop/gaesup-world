const allModules = [
  "gaesup-world",
  "gaesup-world/admin",
  "gaesup-world/assets",
  "gaesup-world/blueprints",
  "gaesup-world/blueprints/editor",
  "gaesup-world/building",
  "gaesup-world/editor",
  "gaesup-world/gameplay",
  "gaesup-world/navigation",
  "gaesup-world/network",
  "gaesup-world/plugins",
  "gaesup-world/postprocessing",
  "gaesup-world/runtime",
  "gaesup-world/server-contracts"
];
const namedModules = [
  [
    "gaesup-world",
    [
      "GaesupWorld",
      "ActionEquipmentPanel",
      "createGaesupRuntime",
      "createBuildingPlugin",
      "requestCameraCloseUp",
      "playCameraCinematic",
      "TeleportOnClick",
      "TeleportMarker",
      "createTeleportDestination",
      "resolveEquippedCharacterAttachments"
    ]
  ],
  [
    "gaesup-world/admin",
    [
      "GaesupAdmin"
    ]
  ],
  [
    "gaesup-world/assets",
    [
      "useAssetStore"
    ]
  ],
  [
    "gaesup-world/blueprints",
    [
      "WARRIOR_BLUEPRINT"
    ]
  ],
  [
    "gaesup-world/blueprints/editor",
    [
      "BlueprintEditor"
    ]
  ],
  [
    "gaesup-world/building",
    [
      "BuildingUI",
      "GrassDriver"
    ]
  ],
  [
    "gaesup-world/editor",
    [
      "Editor",
      "CinematicPanel",
      "createEditorShell"
    ]
  ],
  [
    "gaesup-world/gameplay",
    [
      "GameplayEventEngine",
      "SEED_GAMEPLAY_EVENTS"
    ]
  ],
  [
    "gaesup-world/navigation",
    [
      "NavigationSystem"
    ]
  ],
  [
    "gaesup-world/network",
    [
      "ConnectionForm",
      "defaultMultiplayerConfig"
    ]
  ],
  [
    "gaesup-world/plugins",
    [
      "defineGaesupPlugin"
    ]
  ],
  [
    "gaesup-world/postprocessing",
    [
      "ColorGrade",
      "parseCubeLut"
    ]
  ],
  [
    "gaesup-world/runtime",
    [
      "createGaesupRuntime",
      "createDefaultSaveSystem"
    ]
  ],
  [
    "gaesup-world/server-contracts",
    [
      "createGameCommand",
      "createServerPluginHost"
    ]
  ]
];

for (const specifier of allModules) {
  await import(specifier);
}

for (const [specifier, names] of namedModules) {
  const mod = await import(specifier);
  for (const name of names) {
    if (!(name in mod)) {
      throw new Error(`${specifier} is missing runtime export ${name}`);
    }
  }
}

console.log('ESM runtime import smoke passed.');
