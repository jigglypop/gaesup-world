import { b as x } from "./useSpawnFromBlueprint-C_IzLBK5.js";
import { B as ee, F as te, W as ie, u as se } from "./useSpawnFromBlueprint-C_IzLBK5.js";
import { jsx as C } from "react/jsx-runtime";
import { useMemo as z, useRef as m, useEffect as M } from "react";
import { RigidBody as b } from "@react-three/rapier";
import * as y from "three";
class c {
  factories = /* @__PURE__ */ new Map();
  static instance = null;
  static getInstance() {
    return c.instance || (c.instance = new c()), c.instance;
  }
  register(e, t) {
    this.factories.set(e, t);
  }
  create(e) {
    const t = this.factories.get(e.type);
    if (!t)
      return console.warn(`Component factory not found for type: ${e.type}`), null;
    const s = t(e.properties);
    return s.enabled = e.enabled, s;
  }
  getFactory(e) {
    return this.factories.get(e);
  }
  getAllTypes() {
    return Array.from(this.factories.keys());
  }
  clear() {
    this.factories.clear();
  }
}
class P {
  type;
  enabled = !0;
  context = null;
  constructor(e) {
    this.type = e;
  }
  initialize(e) {
    this.context = e, this.onInitialize();
  }
  update(e) {
    this.enabled && (this.context = e, this.onUpdate(e));
  }
  dispose() {
    this.onDispose(), this.context = null;
  }
}
class B {
  id;
  blueprint;
  components = [];
  context;
  constructor(e, t, s, r) {
    this.id = e.id, this.blueprint = e, this.context = {
      rigidBodyRef: t,
      deltaTime: 0,
      entityId: e.id,
      ...s ? { innerGroupRef: s } : {},
      ...r ? { outerGroupRef: r } : {}
    }, this.createComponents();
  }
  createComponents() {
    const e = c.getInstance();
    for (const t of this.blueprint.components) {
      const s = e.create(t);
      s && (s.initialize(this.context), this.components.push(s));
    }
  }
  update(e) {
    this.context.deltaTime = e;
    for (const t of this.components)
      t.enabled && t.update(this.context);
  }
  getComponent(e) {
    return this.components.find((t) => t.type === e);
  }
  getComponents(e) {
    return this.components.filter((t) => t.type === e);
  }
  addComponent(e) {
    e.initialize(this.context), this.components.push(e);
  }
  removeComponent(e) {
    const t = this.components.findIndex((s) => s.type === e);
    if (t !== -1) {
      const s = this.components[t];
      s && s.dispose(), this.components.splice(t, 1);
    }
  }
  dispose() {
    for (const e of this.components)
      e.dispose();
    this.components = [];
  }
  getId() {
    return this.id;
  }
  getBlueprint() {
    return this.blueprint;
  }
}
class J {
  static blueprints = /* @__PURE__ */ new Map();
  static async load(e) {
    try {
      const s = await (await fetch(e)).json();
      return this.blueprints.set(s.id, s), s;
    } catch (t) {
      throw console.error(`Failed to load blueprint from ${e}:`, t), t;
    }
  }
  static loadFromJSON(e) {
    const t = typeof e == "string" ? JSON.parse(e) : e;
    return this.blueprints.set(t.id, t), t;
  }
  static get(e) {
    return this.blueprints.get(e);
  }
  static getAll() {
    return Array.from(this.blueprints.values());
  }
  static clear() {
    this.blueprints.clear();
  }
}
class D extends P {
  gravity;
  maxFallSpeed;
  force;
  constructor(e = {}) {
    super("GravityForce"), this.gravity = e.gravity ?? -9.81, this.maxFallSpeed = e.maxFallSpeed ?? 50, this.force = new y.Vector3(), this.enabled = e.enabled ?? !0;
  }
  onInitialize() {
    this.force.set(0, this.gravity, 0);
  }
  onUpdate(e) {
    e.rigidBodyRef.current && this.applyForce(e.rigidBodyRef.current, e.deltaTime);
  }
  onDispose() {
    this.force.set(0, 0, 0);
  }
  getForce() {
    return this.force.clone();
  }
  applyForce(e, t) {
    if (e.linvel().y > -this.maxFallSpeed) {
      const r = this.gravity * t * 60;
      e.applyImpulse({ x: 0, y: r, z: 0 }, !0);
    }
  }
  setGravity(e) {
    this.gravity = e, this.force.y = e;
  }
  getGravity() {
    return this.gravity;
  }
}
const f = (i, e) => typeof i == "number" ? i : e, g = (i, e) => typeof i == "string" ? i : e, S = (i, e) => typeof i == "string" || Array.isArray(i) && i.every((t) => typeof t == "string") ? i : e, l = (i) => typeof i == "object" && i !== null && !Array.isArray(i), j = (i) => ({
  ...typeof i.gravity == "number" ? { gravity: i.gravity } : {},
  ...typeof i.maxFallSpeed == "number" ? { maxFallSpeed: i.maxFallSpeed } : {},
  ...typeof i.enabled == "boolean" ? { enabled: i.enabled } : {}
}), E = (i) => ({
  walkSpeed: f(i.walkSpeed, 5),
  runSpeed: f(i.runSpeed, 10),
  jumpHeight: f(i.jumpHeight, 2),
  airControl: f(i.airControl, 0.2)
}), k = (i) => {
  const e = i.animations, t = l(e) && l(e.jump) ? e.jump : {}, s = (p) => {
    if (!(!l(e) || !l(e[p])))
      return Object.fromEntries(
        Object.entries(e[p]).filter(
          ([, a]) => typeof a == "string" || Array.isArray(a) && a.every((h) => typeof h == "string")
        )
      );
  }, r = s("combat"), n = s("special");
  return {
    animations: {
      idle: S(
        l(e) ? e.idle : void 0,
        "idle"
      ),
      walk: S(
        l(e) ? e.walk : void 0,
        "walk"
      ),
      run: S(
        l(e) ? e.run : void 0,
        "run"
      ),
      jump: {
        start: g(t.start, "jump_start"),
        loop: g(t.loop, "jump_loop"),
        land: g(t.land, "jump_land")
      },
      ...r ? { combat: r } : {},
      ...n ? { special: n } : {}
    },
    defaultAnimation: g(i.defaultAnimation, "idle")
  };
};
class I {
  type = "CharacterAnimation";
  enabled = !0;
  props;
  currentAnimation;
  animationMixer;
  actions = /* @__PURE__ */ new Map();
  constructor(e) {
    this.props = e, this.currentAnimation = e.defaultAnimation;
  }
  initialize(e) {
    e.innerGroupRef?.current && (this.animationMixer = new y.AnimationMixer(e.innerGroupRef.current), this.setupAnimations(e));
  }
  setupAnimations(e) {
    const t = window.__loadedAnimations ?? {};
    Object.entries(this.props.animations).forEach(([s, r]) => {
      if (typeof r == "string" && t[r]) {
        const n = this.animationMixer.clipAction(t[r]);
        this.actions.set(s, n);
      }
    }), this.playAnimation(this.currentAnimation);
  }
  playAnimation(e) {
    this.actions.forEach((s) => s.stop());
    const t = this.actions.get(e);
    t && (t.reset().play(), this.currentAnimation = e);
  }
  update(e) {
    if (!this.animationMixer) return;
    this.animationMixer.update(e.deltaTime);
    const t = e.rigidBodyRef.current;
    if (!t) return;
    const s = t.linvel(), r = Math.sqrt(s.x ** 2 + s.z ** 2);
    let n = "idle";
    s.y > 0.1 ? n = "jump" : r > 6 ? n = "run" : r > 0.5 && (n = "walk"), n !== this.currentAnimation && this.playAnimation(n);
  }
  dispose() {
    this.actions.forEach((e) => e.stop()), this.actions.clear(), this.animationMixer?.stopAllAction();
  }
}
class T {
  type = "CharacterMovement";
  enabled = !0;
  props;
  velocity = new y.Vector3();
  isGrounded = !1;
  constructor(e) {
    this.props = e;
  }
  initialize(e) {
    e.rigidBodyRef.current && e.rigidBodyRef.current.setEnabledRotations(!1, !1, !1, !1);
  }
  update(e) {
    if (!e.rigidBodyRef.current) return;
    const t = e.rigidBodyRef.current, s = t.linvel(), r = window.__keyboardState ?? {}, n = window.__mouseState, p = (r.rightward ? 1 : 0) - (r.leftward ? 1 : 0), a = (r.backward ? 1 : 0) - (r.forward ? 1 : 0), h = r.shift ? this.props.runSpeed : this.props.walkSpeed;
    if (p !== 0 || a !== 0) {
      const o = new y.Vector3(p, 0, a).normalize();
      o.multiplyScalar(h), n?.angle !== void 0 && o.applyAxisAngle(new y.Vector3(0, 1, 0), n.angle), this.velocity.x = o.x, this.velocity.z = o.z;
    } else
      this.velocity.x *= 0.9, this.velocity.z *= 0.9;
    r.space && this.isGrounded ? this.velocity.y = Math.sqrt(2 * 9.81 * this.props.jumpHeight) : this.velocity.y = s.y, t.setLinvel(this.velocity, !0);
  }
  dispose() {
    this.velocity.set(0, 0, 0);
  }
}
function $() {
  const i = c.getInstance();
  i.register("GravityForce", (e) => new D(j(e))), i.register("CharacterMovement", (e) => new T(E(e))), i.register("CharacterAnimation", (e) => new I(k(e))), i.register("CharacterPhysics", (e) => ({
    type: "CharacterPhysics",
    enabled: !0,
    initialize: () => {
    },
    update: () => {
    },
    dispose: () => {
    },
    ...e
  })), i.register("CharacterStats", (e) => ({
    type: "CharacterStats",
    enabled: !0,
    initialize: () => {
    },
    update: () => {
    },
    dispose: () => {
    },
    ...e
  })), i.register("CharacterBehavior", (e) => ({
    type: "CharacterBehavior",
    enabled: !0,
    initialize: () => {
    },
    update: () => {
    },
    dispose: () => {
    },
    ...e
  })), i.register("VehicleMovement", (e) => ({
    type: "VehicleMovement",
    enabled: !0,
    initialize: () => {
    },
    update: () => {
    },
    dispose: () => {
    },
    ...e
  })), i.register("VehiclePhysics", (e) => ({
    type: "VehiclePhysics",
    enabled: !0,
    initialize: () => {
    },
    update: () => {
    },
    dispose: () => {
    },
    ...e
  })), i.register("VehicleSeats", (e) => ({
    type: "VehicleSeats",
    enabled: !0,
    initialize: () => {
    },
    update: () => {
    },
    dispose: () => {
    },
    ...e
  })), i.register("VehicleAnimation", (e) => ({
    type: "VehicleAnimation",
    enabled: !0,
    initialize: () => {
    },
    update: () => {
    },
    dispose: () => {
    },
    ...e
  })), i.register("AirplaneMovement", (e) => ({
    type: "AirplaneMovement",
    enabled: !0,
    initialize: () => {
    },
    update: () => {
    },
    dispose: () => {
    },
    ...e
  })), i.register("AirplanePhysics", (e) => ({
    type: "AirplanePhysics",
    enabled: !0,
    initialize: () => {
    },
    update: () => {
    },
    dispose: () => {
    },
    ...e
  })), i.register("AirplaneSeats", (e) => ({
    type: "AirplaneSeats",
    enabled: !0,
    initialize: () => {
    },
    update: () => {
    },
    dispose: () => {
    },
    ...e
  })), i.register("AirplaneAnimation", (e) => ({
    type: "AirplaneAnimation",
    enabled: !0,
    initialize: () => {
    },
    update: () => {
    },
    dispose: () => {
    },
    ...e
  }));
}
class G {
  convert(e) {
    const t = {
      id: e.id,
      name: e.name,
      type: e.type,
      components: [],
      ...e.metadata ? { metadata: e.metadata } : {}
    };
    switch (e.type) {
      case "character":
        return this.convertCharacter(e, t);
      case "vehicle":
        return this.convertVehicle(e, t);
      case "airplane":
        return this.convertAirplane(e, t);
      default:
        return t;
    }
  }
  convertCharacter(e, t) {
    const s = [];
    return s.push({
      type: "CharacterPhysics",
      enabled: !0,
      properties: {
        mass: e.physics.mass,
        height: e.physics.height,
        radius: e.physics.radius,
        jumpForce: e.physics.jumpForce,
        moveSpeed: e.physics.moveSpeed,
        runSpeed: e.physics.runSpeed,
        airControl: e.physics.airControl
      }
    }), s.push({
      type: "CharacterMovement",
      enabled: !0,
      properties: {
        walkSpeed: e.physics.moveSpeed,
        runSpeed: e.physics.runSpeed,
        jumpHeight: e.physics.jumpForce / e.physics.mass,
        airControl: e.physics.airControl
      }
    }), s.push({
      type: "CharacterAnimation",
      enabled: !0,
      properties: {
        animations: e.animations,
        defaultAnimation: "idle"
      }
    }), e.stats && s.push({
      type: "CharacterStats",
      enabled: !0,
      properties: e.stats
    }), e.behaviors && s.push({
      type: "CharacterBehavior",
      enabled: !0,
      properties: {
        type: e.behaviors.type,
        data: e.behaviors.data
      }
    }), {
      ...t,
      components: s,
      physics: {
        mass: e.physics.mass,
        friction: 0.5,
        restitution: 0,
        linearDamping: 4,
        angularDamping: 10
      }
    };
  }
  convertVehicle(e, t) {
    const s = [];
    return s.push({
      type: "VehiclePhysics",
      enabled: !0,
      properties: {
        mass: e.physics.mass,
        maxSpeed: e.physics.maxSpeed,
        acceleration: e.physics.acceleration,
        braking: e.physics.braking,
        turning: e.physics.turning,
        ...e.physics.suspension ? { suspension: e.physics.suspension } : {}
      }
    }), s.push({
      type: "VehicleMovement",
      enabled: !0,
      properties: {
        maxSpeed: e.physics.maxSpeed,
        acceleration: e.physics.acceleration,
        braking: e.physics.braking,
        turning: e.physics.turning
      }
    }), e.seats && s.push({
      type: "VehicleSeats",
      enabled: !0,
      properties: {
        seats: e.seats
      }
    }), e.animations && s.push({
      type: "VehicleAnimation",
      enabled: !0,
      properties: {
        animations: e.animations
      }
    }), {
      ...t,
      components: s,
      physics: {
        mass: e.physics.mass,
        friction: 0.8,
        restitution: 0.2,
        linearDamping: 0.5,
        angularDamping: 1
      }
    };
  }
  convertAirplane(e, t) {
    const s = [];
    return s.push({
      type: "AirplanePhysics",
      enabled: !0,
      properties: {
        mass: e.physics.mass,
        maxSpeed: e.physics.maxSpeed,
        acceleration: e.physics.acceleration,
        turning: e.physics.turning,
        lift: e.physics.lift,
        drag: e.physics.drag
      }
    }), s.push({
      type: "AirplaneMovement",
      enabled: !0,
      properties: {
        maxSpeed: e.physics.maxSpeed,
        acceleration: e.physics.acceleration,
        turning: e.physics.turning,
        lift: e.physics.lift,
        drag: e.physics.drag
      }
    }), e.seats && s.push({
      type: "AirplaneSeats",
      enabled: !0,
      properties: {
        seats: e.seats
      }
    }), e.animations && s.push({
      type: "AirplaneAnimation",
      enabled: !0,
      properties: {
        animations: e.animations
      }
    }), {
      ...t,
      components: s,
      physics: {
        mass: e.physics.mass,
        friction: 0.1,
        restitution: 0.1,
        linearDamping: 0.2,
        angularDamping: 0.5
      }
    };
  }
  convertToJSON(e) {
    const t = this.convert(e);
    return JSON.stringify(t, null, 2);
  }
  validateBlueprint(e) {
    const t = [];
    switch (e.id || t.push("Blueprint must have an id"), e.name || t.push("Blueprint must have a name"), e.type || t.push("Blueprint must have a type"), e.version || t.push("Blueprint must have a version"), e.type) {
      case "character":
        const s = e;
        s.physics || t.push("Character blueprint must have physics"), s.animations || t.push("Character blueprint must have animations"), s.stats || t.push("Character blueprint must have stats");
        break;
      case "vehicle":
        const r = e;
        r.physics || t.push("Vehicle blueprint must have physics"), r.seats || t.push("Vehicle blueprint must have seats");
        break;
      case "airplane":
        const n = e;
        n.physics || t.push("Airplane blueprint must have physics"), n.seats || t.push("Airplane blueprint must have seats");
        break;
    }
    return {
      valid: t.length === 0,
      errors: t
    };
  }
}
class u {
  static instance;
  converter;
  componentRegistry;
  constructor() {
    this.converter = new G(), this.componentRegistry = c.getInstance(), this.initializeDefaultFactories();
  }
  static getInstance() {
    return u.instance || (u.instance = new u()), u.instance;
  }
  initializeDefaultFactories() {
    this.registerCharacterFactories(), this.registerVehicleFactories(), this.registerAirplaneFactories();
  }
  registerCharacterFactories() {
    this.componentRegistry.register("CharacterMovement", (e) => ({
      type: "CharacterMovement",
      enabled: !0,
      initialize: () => {
      },
      update: () => {
      },
      dispose: () => {
      },
      ...e
    })), this.componentRegistry.register("CharacterAnimation", (e) => ({
      type: "CharacterAnimation",
      enabled: !0,
      initialize: () => {
      },
      update: () => {
      },
      dispose: () => {
      },
      ...e
    })), this.componentRegistry.register("CharacterPhysics", (e) => ({
      type: "CharacterPhysics",
      enabled: !0,
      initialize: () => {
      },
      update: () => {
      },
      dispose: () => {
      },
      ...e
    }));
  }
  registerVehicleFactories() {
    this.componentRegistry.register("VehicleMovement", (e) => ({
      type: "VehicleMovement",
      enabled: !0,
      initialize: () => {
      },
      update: () => {
      },
      dispose: () => {
      },
      ...e
    })), this.componentRegistry.register("VehiclePhysics", (e) => ({
      type: "VehiclePhysics",
      enabled: !0,
      initialize: () => {
      },
      update: () => {
      },
      dispose: () => {
      },
      ...e
    }));
  }
  registerAirplaneFactories() {
    this.componentRegistry.register("AirplaneMovement", (e) => ({
      type: "AirplaneMovement",
      enabled: !0,
      initialize: () => {
      },
      update: () => {
      },
      dispose: () => {
      },
      ...e
    })), this.componentRegistry.register("AirplanePhysics", (e) => ({
      type: "AirplanePhysics",
      enabled: !0,
      initialize: () => {
      },
      update: () => {
      },
      dispose: () => {
      },
      ...e
    }));
  }
  createEntity(e, t) {
    const s = this.converter.convert(e);
    return new B(
      s,
      t.rigidBodyRef,
      t.innerGroupRef,
      t.outerGroupRef
    );
  }
  async createFromId(e, t) {
    const { blueprintRegistry: s } = await import("./useSpawnFromBlueprint-C_IzLBK5.js").then((n) => n.r), r = s.get(e);
    return r ? this.createEntity(r, t) : (console.error(`Blueprint not found: ${e}`), null);
  }
  createFromDefinition(e, t) {
    return new B(
      e,
      t.rigidBodyRef,
      t.innerGroupRef,
      t.outerGroupRef
    );
  }
  registerComponentFactory(e, t) {
    this.componentRegistry.register(e, t);
  }
  getAvailableComponentTypes() {
    return this.componentRegistry.getAllTypes();
  }
}
function w(i) {
  return z(() => x.get(i), [i]);
}
function q(i) {
  const e = w(i);
  if (e?.type === "character")
    return e;
}
function W(i) {
  const e = w(i);
  if (e?.type === "vehicle")
    return e;
}
function K(i) {
  const e = w(i);
  if (e?.type === "airplane")
    return e;
}
function X(i) {
  return z(() => x.getByType(i), [i]);
}
function Z({
  blueprint: i,
  blueprintId: e,
  position: t = [0, 0, 0],
  rotation: s = [0, 0, 0],
  scale: r = [1, 1, 1],
  onSpawn: n,
  onDestroy: p,
  children: a
}) {
  const h = m(null), o = m(null), v = m(null), A = m(null);
  M(() => {
    const R = u.getInstance();
    return (async () => {
      let d = null;
      i ? d = R.createEntity(i, {
        rigidBodyRef: h,
        innerGroupRef: o,
        outerGroupRef: v,
        position: t,
        rotation: s,
        scale: r
      }) : e && (d = await R.createFromId(e, {
        rigidBodyRef: h,
        innerGroupRef: o,
        outerGroupRef: v,
        position: t,
        rotation: s,
        scale: r
      })), d && (A.current = d, n?.(d));
    })(), () => {
      A.current && (A.current.dispose(), p?.());
    };
  }, [i, e]);
  const F = i?.type || "character", V = O(F);
  return /* @__PURE__ */ C(
    b,
    {
      ref: h,
      type: "dynamic",
      position: t,
      rotation: s,
      scale: r,
      ...V,
      children: /* @__PURE__ */ C("group", { ref: v, children: /* @__PURE__ */ C("group", { ref: o, children: a }) })
    }
  );
}
function O(i) {
  switch (i) {
    case "character":
      return {
        mass: 1,
        friction: 0.5,
        restitution: 0,
        linearDamping: 4,
        angularDamping: 10,
        enabledRotations: [!1, !1, !1]
      };
    case "vehicle":
      return {
        mass: 150,
        friction: 0.8,
        restitution: 0.2,
        linearDamping: 0.5,
        angularDamping: 1
      };
    case "airplane":
      return {
        mass: 500,
        friction: 0.1,
        restitution: 0.1,
        linearDamping: 0.2,
        angularDamping: 0.5
      };
    default:
      return {
        mass: 1,
        friction: 0.5,
        restitution: 0.5
      };
  }
}
export {
  ee as BASIC_KART_BLUEPRINT,
  P as BaseComponent,
  G as BlueprintConverter,
  B as BlueprintEntity,
  u as BlueprintFactory,
  J as BlueprintLoader,
  Z as BlueprintSpawner,
  c as ComponentRegistry,
  te as FIRE_MAGE_BLUEPRINT,
  D as GravityForceComponent,
  ie as WARRIOR_BLUEPRINT,
  x as blueprintRegistry,
  $ as registerDefaultComponents,
  K as useAirplaneBlueprint,
  w as useBlueprint,
  X as useBlueprintsByType,
  q as useCharacterBlueprint,
  se as useSpawnFromBlueprint,
  W as useVehicleBlueprint
};
