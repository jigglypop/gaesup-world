import { useState as T, useCallback as v } from "react";
import * as _ from "three";
import { u as k, B as U } from "./gaesupStore-x2iiDzsY.js";
const j = {
  id: "char_mage_fire",
  name: "Fire Mage",
  type: "character",
  version: "1.0.0",
  tags: ["magic", "ranged", "fire"],
  description: "A powerful mage specializing in fire magic",
  physics: {
    mass: 60,
    height: 1.75,
    radius: 0.25,
    jumpForce: 300,
    moveSpeed: 4,
    runSpeed: 8,
    airControl: 0.3
  },
  animations: {
    idle: "mage_idle.glb",
    walk: "mage_walk.glb",
    run: "mage_run.glb",
    jump: {
      start: "mage_jump_start.glb",
      loop: "mage_jump_loop.glb",
      land: "mage_jump_land.glb"
    },
    combat: {
      cast_fireball: "cast_fireball.glb",
      cast_meteor: "cast_meteor.glb",
      cast_firewall: "cast_firewall.glb",
      channel: "channel_spell.glb"
    },
    special: {
      meditate: "meditate.glb",
      teleport: "teleport.glb"
    }
  },
  behaviors: {
    type: "state-machine",
    data: {
      initial: "idle",
      states: {
        idle: {
          on: {
            MOVE: "moving",
            CAST: "casting",
            MEDITATE: "meditating"
          }
        },
        moving: {
          on: {
            STOP: "idle",
            CAST: "casting"
          }
        },
        casting: {
          on: {
            FINISH: "idle",
            INTERRUPT: "idle"
          }
        },
        meditating: {
          on: {
            FINISH: "idle",
            INTERRUPT: "idle"
          }
        }
      }
    }
  },
  stats: {
    health: 70,
    stamina: 30,
    mana: 100,
    strength: 5,
    defense: 8,
    speed: 12
  },
  visuals: {
    model: "mage_model.glb",
    textures: ["mage_diffuse.png", "mage_normal.png", "mage_emissive.png"],
    scale: 1
  }
}, M = {
  id: "char_warrior_basic",
  name: "Basic Warrior",
  type: "character",
  version: "1.0.0",
  tags: ["melee", "tank", "starter"],
  description: "A basic warrior character with sword and shield",
  physics: {
    mass: 80,
    height: 1.8,
    radius: 0.3,
    jumpForce: 350,
    moveSpeed: 5,
    runSpeed: 10,
    airControl: 0.2
  },
  animations: {
    idle: "warrior_idle.glb",
    walk: "warrior_walk.glb",
    run: "warrior_run.glb",
    jump: {
      start: "warrior_jump_start.glb",
      loop: "warrior_jump_loop.glb",
      land: "warrior_jump_land.glb"
    },
    combat: {
      attack_light: ["attack_1.glb", "attack_2.glb", "attack_3.glb"],
      attack_heavy: "attack_heavy.glb",
      block: "block.glb",
      parry: "parry.glb"
    }
  },
  behaviors: {
    type: "state-machine",
    data: {
      initial: "idle",
      states: {
        idle: {
          on: {
            MOVE: "moving",
            ATTACK: "combat"
          }
        },
        moving: {
          on: {
            STOP: "idle",
            ATTACK: "combat"
          }
        },
        combat: {
          on: {
            FINISH: "idle"
          }
        }
      }
    }
  },
  stats: {
    health: 100,
    stamina: 50,
    strength: 15,
    defense: 12,
    speed: 10
  },
  visuals: {
    parts: [
      {
        id: "warrior-body",
        type: "body",
        url: "gltf/ally_body.glb"
      },
      {
        id: "warrior-cloth",
        type: "top",
        url: "gltf/ally_cloth_rabbit.glb"
      }
    ],
    scale: 1
  },
  camera: {
    mode: "thirdPerson",
    distance: { x: 15, y: 8, z: 15 },
    fov: 50,
    smoothing: { position: 0.1, rotation: 0.1, fov: 0.1 },
    enableCollision: !0,
    enableZoom: !0,
    zoomSpeed: 1e-3,
    minZoom: 0.5,
    maxZoom: 2
  },
  controls: {
    enableKeyboard: !0,
    enableMouse: !0,
    enableGamepad: !1,
    clickToMove: !0
  }
}, F = {
  id: "vehicle_kart_basic",
  name: "Basic Kart",
  type: "vehicle",
  version: "1.0.0",
  tags: ["land", "fast", "small"],
  description: "A small and nimble racing kart",
  physics: {
    mass: 150,
    maxSpeed: 30,
    acceleration: 15,
    braking: 20,
    turning: 2.5,
    suspension: {
      stiffness: 30,
      damping: 3,
      restLength: 0.3,
      maxTravel: 0.2
    }
  },
  seats: [
    {
      position: [0, 0.5, 0],
      isDriver: !0
    }
  ],
  animations: {
    idle: "kart_idle.glb",
    moving: "kart_moving.glb",
    wheels: ["wheel_fl.glb", "wheel_fr.glb", "wheel_bl.glb", "wheel_br.glb"]
  }
};
class b {
  static instance;
  blueprints = /* @__PURE__ */ new Map();
  constructor() {
    this.registerDefaults();
  }
  static getInstance() {
    return b.instance || (b.instance = new b()), b.instance;
  }
  registerDefaults() {
    this.register(M), this.register(j), this.register(F);
  }
  register(e) {
    this.blueprints.set(e.id, e);
  }
  get(e) {
    return this.blueprints.get(e);
  }
  getByType(e) {
    const n = [];
    return this.blueprints.forEach((g) => {
      g.type === e && n.push(g);
    }), n;
  }
  getAll() {
    return Array.from(this.blueprints.values());
  }
  has(e) {
    return this.blueprints.has(e);
  }
  remove(e) {
    return this.blueprints.delete(e);
  }
  clear() {
    this.blueprints.clear();
  }
}
const I = b.getInstance(), x = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  blueprintRegistry: I
}, Symbol.toStringTag, { value: "Module" })), O = "default", E = (r, e) => {
  const n = r?.[e];
  return typeof n == "string" ? n : "";
}, A = (r) => r.type === "character" ? r.visuals?.model ?? E(r.metadata, "modelUrl") : E(r.metadata, "modelUrl");
function P() {
  const [r, e] = T(!1), [n, g] = T(null), p = k((t) => t.setMode), u = k((t) => t.setUrls), o = v(async (t, s = {}) => {
    e(!0);
    try {
      const a = I.get(t);
      if (!a)
        return console.error(`Blueprint not found: ${t}`), null;
      const m = `${a.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, c = s.position || [0, 0, 0], d = s.rotation || [0, 0, 0], i = s.scale || [1, 1, 1], h = R(m, a, c, d, i, s.metadata), l = U.getOrCreate("world");
      if (!l)
        return console.error("WorldBridge not found. Make sure it is properly initialized."), null;
      l.addObject(O, h);
      const w = A(a);
      a.type === "character" ? (p({ type: "character" }), u({ characterUrl: w })) : a.type === "vehicle" ? (p({ type: "vehicle" }), u({ vehicleUrl: w })) : a.type === "airplane" && (p({ type: "airplane" }), u({ airplaneUrl: w }));
      const S = {
        id: m,
        blueprintId: a.id,
        type: a.type,
        position: c,
        rotation: d,
        scale: i,
        metadata: s.metadata || {}
      };
      return g(S), S;
    } catch (a) {
      return console.error("Failed to spawn entity:", a), null;
    } finally {
      e(!1);
    }
  }, [p, u]), y = v(async (t) => {
    const s = window.__camera;
    if (!s)
      return o(t);
    const a = new _.Raycaster(), m = new _.Vector2(0, 0);
    a.setFromCamera(m, s);
    const c = window.__scene, d = c ? a.intersectObjects(c.children, !0) : [];
    let i = [0, 0, 0];
    const h = d[0];
    if (h?.point) {
      const l = h.point;
      i = [l.x, l.y, l.z];
    }
    return o(t, { position: i });
  }, [o]), f = v(async (t, s, a = {}) => {
    const m = [], c = a.spacing || 2, d = a.position || [0, 0, 0];
    for (let i = 0; i < s; i++) {
      const h = [
        d[0] + i % 5 * c,
        d[1],
        d[2] + Math.floor(i / 5) * c
      ], l = await o(t, { ...a, position: h });
      l && m.push(l);
    }
    return m;
  }, [o]);
  return {
    spawnEntity: o,
    spawnAtCursor: y,
    spawnMultiple: f,
    isSpawning: r,
    lastSpawnedEntity: n
  };
}
function R(r, e, n, g, p, u) {
  const o = {
    id: r,
    name: e.name,
    position: new _.Vector3(...n),
    rotation: new _.Euler(...g),
    scale: new _.Vector3(...p),
    visible: !0,
    locked: !1,
    metadata: {
      blueprintId: e.id,
      ...e.metadata,
      ...u
    }
  }, y = A(e), f = e.type === "vehicle" || e.type === "airplane" ? e.seats : void 0, t = e.type === "character" ? e.stats : void 0;
  return {
    ...o,
    type: "active",
    isActive: !0,
    canInteract: !0,
    metadata: {
      ...o.metadata,
      blueprintType: e.type,
      characterUrl: e.type === "character" ? y : "",
      vehicleUrl: e.type === "vehicle" ? y : "",
      airplaneUrl: e.type === "airplane" ? y : "",
      currentAnimation: "idle",
      ...t ? { stats: t } : {},
      ...f ? { seats: f } : {},
      health: t?.health || 100,
      maxHealth: t?.health || 100,
      energy: t?.stamina || 100,
      maxEnergy: t?.stamina || 100,
      fuel: 100,
      maxFuel: 100,
      altitude: 0
    }
  };
}
export {
  F as B,
  j as F,
  M as W,
  I as b,
  x as r,
  P as u
};
