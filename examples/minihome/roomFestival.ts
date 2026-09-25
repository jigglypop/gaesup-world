import { AdditiveBlending, BufferAttribute, BufferGeometry, Color, CylinderGeometry, DoubleSide, ExtrudeGeometry, Float32BufferAttribute, Group, InstancedMesh, LineBasicMaterial, LineSegments, Matrix4, Mesh, MeshBasicMaterial, MeshStandardMaterial, OctahedronGeometry, PlaneGeometry, Quaternion, Shape, SphereGeometry, TorusGeometry, Vector3, type Scene } from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

import type { RoomLighting, RoomQuality } from './roomTypes';

export type FestivalDiagnostics = {
  enabled: boolean;
  sparkles: number;
  hearts: number;
  balloons: number;
  bulbs: number;
  rainbow: boolean;
  fireworks: number;
  confetti: number;
};

type HeightSampler = (x: number, z: number) => number;

const SPARKLES: Record<RoomQuality, number> = { economy: 70, balanced: 140, high: 220 };
const HEARTS = 14;
const BALLOONS_PER_CLUSTER = 5;
const BULBS_PER_SPAN = 7;
const GARLAND_SPAN = 4;
const GARLAND_HEIGHT = 1.75;
const GARLAND_SAG = 0.32;
const FIREWORK_BURSTS = 3;
const FIREWORK_PARTICLES = 56;
const FIREWORK_LIFE = 1.9;
const CONFETTI = 96;
const CONFETTI_LIFE = 1.7;
const GRAVITY = 6.5;

const RAINBOW = ['#ff6b81', '#ffa94d', '#ffe066', '#8ce99a', '#74c0fc', '#9775fa', '#f783ac'];
const PARTY = ['#ff4f8b', '#ffc233', '#2fe0b0', '#5b8cff', '#b86bff', '#ff8a3d', '#fff06a'];
const BALLOON = ['#ff6f91', '#ffc75f', '#6fd6c8', '#8fa8ff', '#ff9671', '#c493ff'];

/** Deterministic layout keeps screenshots and regression checks stable. */
export function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function heartGeometry(): ExtrudeGeometry {
  const shape = new Shape();
  for (let i = 0; i <= 64; i++) {
    const t = (i / 64) * Math.PI * 2;
    const x = 16 * Math.sin(t) ** 3 / 32;
    const y = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 32;
    if (i === 0) shape.moveTo(x, y); else shape.lineTo(x, y);
  }
  const geometry = new ExtrudeGeometry(shape, { depth: 0.14, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 2, curveSegments: 8 });
  geometry.center();
  return geometry;
}

function rainbowGeometry(radius: number): BufferGeometry {
  const bands = RAINBOW.map((hex, index) => {
    const band = new TorusGeometry(radius - index * 0.46, 0.24, 8, 72, Math.PI);
    const color = new Color(hex).multiplyScalar(1.15);
    const count = band.getAttribute('position').count;
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) color.toArray(colors, i * 3);
    band.setAttribute('color', new BufferAttribute(colors, 3));
    return band;
  });
  const merged = mergeGeometries(bands);
  for (const band of bands) band.dispose();
  if (!merged) throw new Error('무지개 형상을 만들 수 없습니다.');
  return merged;
}

type Firework = { x: number; y: number; z: number; age: number; delay: number; hue: Color };

/**
 * Decorative festival layer: sparkles, floating hearts, balloons, a perimeter garland, a daytime
 * rainbow, evening fireworks and confetti bursts. None of it casts shadows or takes part in picking.
 * Continuous motion follows the room's nature-motion switch; only confetti bursts request extra frames.
 */
export function createRoomFestival(scene: Scene, sampleHeight: HeightSampler = () => 0) {
  const root = new Group(); root.name = '축제 장식'; scene.add(root);
  const matrix = new Matrix4(); const position = new Vector3(); const scale = new Vector3(); const rotation = new Quaternion();
  const axisY = new Vector3(0, 1, 0); const confettiAxis = new Vector3(1, 0.6, 0.3).normalize();
  const spin = new Quaternion(); const tint = new Color(); const fireworkRandom = seededRandom(101);

  const sparkleGeometry = new OctahedronGeometry(0.1, 0);
  const sparkleMaterial = new MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.92, depthWrite: false, blending: AdditiveBlending, toneMapped: false });
  const heartGeo = heartGeometry();
  const heartMaterial = new MeshStandardMaterial({ color: '#ffffff', roughness: 0.28, metalness: 0.05, emissive: '#ff5c8a', emissiveIntensity: 0.35 });
  const balloonGeometry = new SphereGeometry(1, 20, 16);
  const balloonMaterial = new MeshStandardMaterial({ color: '#ffffff', roughness: 0.22, metalness: 0.02 });
  const stringMaterial = new LineBasicMaterial({ color: '#fdf6e3', transparent: true, opacity: 0.8 });
  const postGeometry = new CylinderGeometry(0.045, 0.06, 1, 8);
  const postMaterial = new MeshStandardMaterial({ color: '#8b6b52', roughness: 0.8 });
  const wireMaterial = new LineBasicMaterial({ color: '#3d3a36', transparent: true, opacity: 0.75 });
  const bulbGeometry = new SphereGeometry(0.075, 10, 8);
  const bulbMaterial = new MeshBasicMaterial({ color: '#ffffff', toneMapped: false });
  const rainbowMaterial = new MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.5, depthWrite: false, side: DoubleSide, toneMapped: false });
  const fireworkGeometry = new OctahedronGeometry(0.16, 0);
  const fireworkMaterial = new MeshBasicMaterial({ color: '#ffffff', transparent: true, depthWrite: false, blending: AdditiveBlending, toneMapped: false });
  const confettiGeometry = new PlaneGeometry(0.16, 0.09);
  const confettiMaterial = new MeshBasicMaterial({ color: '#ffffff', side: DoubleSide, toneMapped: false });

  const geometries: BufferGeometry[] = [sparkleGeometry, heartGeo, balloonGeometry, postGeometry, bulbGeometry, fireworkGeometry, confettiGeometry];
  const materials = [sparkleMaterial, heartMaterial, balloonMaterial, stringMaterial, postMaterial, wireMaterial, bulbMaterial, rainbowMaterial, fireworkMaterial, confettiMaterial];

  function instanced(name: string, geometry: BufferGeometry, material: MeshBasicMaterial | MeshStandardMaterial, count: number) {
    const mesh = new InstancedMesh(geometry, material, Math.max(1, count));
    mesh.name = name; mesh.castShadow = false; mesh.receiveShadow = false; mesh.frustumCulled = false; mesh.count = count;
    root.add(mesh);
    return mesh;
  }

  let enabled = true; let lighting: RoomLighting = 'day'; let quality: RoomQuality = 'balanced';
  let size = 24; let elapsed = 0; let animating = false;

  let sparkles = instanced('반짝이', sparkleGeometry, sparkleMaterial, SPARKLES[quality]);
  let sparkleSeeds = new Float32Array(0);
  const hearts = instanced('떠다니는 하트', heartGeo, heartMaterial, HEARTS);
  const heartSeeds = new Float32Array(HEARTS * 5);
  let balloons = instanced('풍선', balloonGeometry, balloonMaterial, 0);
  let balloonSeeds = new Float32Array(0);
  const strings = new LineSegments(new BufferGeometry(), stringMaterial); strings.name = '풍선 줄'; strings.frustumCulled = false; root.add(strings);
  let posts = instanced('가랜드 기둥', postGeometry, postMaterial, 0);
  let bulbs = instanced('가랜드 전구', bulbGeometry, bulbMaterial, 0);
  let bulbBase = new Float32Array(0);
  const wires = new LineSegments(new BufferGeometry(), wireMaterial); wires.name = '가랜드 전선'; wires.frustumCulled = false; root.add(wires);
  let rainbow: Mesh | null = null;
  const rainbowGroup = new Group(); rainbowGroup.name = '무지개'; root.add(rainbowGroup);
  const fireworks = instanced('불꽃놀이', fireworkGeometry, fireworkMaterial, FIREWORK_BURSTS * FIREWORK_PARTICLES);
  const fireworkDirections = new Float32Array(FIREWORK_PARTICLES * 3);
  const bursts: Firework[] = [];
  const confetti = instanced('색종이', confettiGeometry, confettiMaterial, CONFETTI);
  const confettiState = new Float32Array(CONFETTI * 8);
  let confettiAge = Infinity;

  {
    const random = seededRandom(7);
    for (let i = 0; i < FIREWORK_PARTICLES; i++) {
      const u = random() * 2 - 1; const theta = random() * Math.PI * 2; const r = Math.sqrt(1 - u * u);
      const speed = 2.6 + random() * 1.4;
      fireworkDirections[i * 3] = r * Math.cos(theta) * speed; fireworkDirections[i * 3 + 1] = u * speed; fireworkDirections[i * 3 + 2] = r * Math.sin(theta) * speed;
    }
    for (let b = 0; b < FIREWORK_BURSTS; b++) bursts.push({ x: (b - 1) * 5, y: 7.5 + b, z: (1 - b) * 3, age: 0, delay: b * 0.6, hue: new Color(PARTY[b % PARTY.length]) });
    for (let i = 0; i < CONFETTI; i++) confetti.setColorAt(i, tint.set(PARTY[i % PARTY.length]!).multiplyScalar(1.3));
    confetti.count = 0;
  }

  function relayoutSparkles() {
    const count = SPARKLES[quality];
    if (sparkles.instanceMatrix.count < count) {
      sparkles.removeFromParent(); sparkles.dispose();
      sparkles = instanced('반짝이', sparkleGeometry, sparkleMaterial, count);
    }
    sparkles.count = count;
    sparkleSeeds = new Float32Array(count * 5);
    const random = seededRandom(11); const half = size / 2 + 1.5;
    for (let i = 0; i < count; i++) {
      sparkleSeeds[i * 5] = (random() * 2 - 1) * half;
      sparkleSeeds[i * 5 + 1] = 0.7 + random() * 4.2;
      sparkleSeeds[i * 5 + 2] = (random() * 2 - 1) * half;
      sparkleSeeds[i * 5 + 3] = random() * Math.PI * 2;
      sparkleSeeds[i * 5 + 4] = 0.6 + random() * 0.9;
      sparkles.setColorAt(i, tint.set(PARTY[i % PARTY.length]!).multiplyScalar(1.6));
    }
    if (sparkles.instanceColor) sparkles.instanceColor.needsUpdate = true;
  }

  function relayoutHearts() {
    const random = seededRandom(23); const spread = size * 0.45;
    for (let i = 0; i < HEARTS; i++) {
      heartSeeds[i * 5] = (random() * 2 - 1) * spread;
      heartSeeds[i * 5 + 1] = 1.5 + random() * 8;
      heartSeeds[i * 5 + 2] = (random() * 2 - 1) * spread;
      heartSeeds[i * 5 + 3] = random() * Math.PI * 2;
      heartSeeds[i * 5 + 4] = 0.28 + random() * 0.22;
      hearts.setColorAt(i, tint.set(i % 3 === 0 ? '#ff4d8d' : i % 3 === 1 ? '#ff8fb8' : '#ffc2d6'));
    }
    if (hearts.instanceColor) hearts.instanceColor.needsUpdate = true;
  }

  function relayoutBalloons() {
    const f = size / 24;
    const anchors: Array<[number, number]> = [[1.4 * f, 3.6 * f], [8.2 * f, 8.2 * f], [-8.6 * f, 8.8 * f], [-10.2 * f, -3.2 * f]];
    const count = anchors.length * BALLOONS_PER_CLUSTER;
    if (balloons.instanceMatrix.count < count) {
      balloons.removeFromParent(); balloons.dispose();
      balloons = instanced('풍선', balloonGeometry, balloonMaterial, count);
    }
    balloons.count = count;
    balloonSeeds = new Float32Array(count * 6);
    const random = seededRandom(31);
    anchors.forEach(([ax, az], cluster) => {
      const ground = sampleHeight(ax, az);
      for (let j = 0; j < BALLOONS_PER_CLUSTER; j++) {
        const i = cluster * BALLOONS_PER_CLUSTER + j; const angle = (j / BALLOONS_PER_CLUSTER) * Math.PI * 2 + random() * 0.6;
        balloonSeeds[i * 6] = ax; balloonSeeds[i * 6 + 1] = ground; balloonSeeds[i * 6 + 2] = az;
        balloonSeeds[i * 6 + 3] = angle; balloonSeeds[i * 6 + 4] = 2.3 + random() * 1.1; balloonSeeds[i * 6 + 5] = random() * Math.PI * 2;
        balloons.setColorAt(i, tint.set(BALLOON[(i + cluster) % BALLOON.length]!));
      }
    });
    if (balloons.instanceColor) balloons.instanceColor.needsUpdate = true;
    strings.geometry.dispose(); strings.geometry = new BufferGeometry();
    strings.geometry.setAttribute('position', new Float32BufferAttribute(new Float32Array(count * 6), 3));
  }

  function relayoutGarland() {
    const edge = size / 2 - 0.35; const spans = Math.max(4, Math.round((size * 4) / GARLAND_SPAN));
    const perimeter = edge * 8; const corners: Array<[number, number]> = [[-edge, -edge], [edge, -edge], [edge, edge], [-edge, edge]];
    const pointAt = (distance: number): [number, number] => {
      const side = Math.min(3, Math.floor(distance / (edge * 2))); const t = (distance - side * edge * 2) / (edge * 2);
      const [x0, z0] = corners[side]!; const [x1, z1] = corners[(side + 1) % 4]!;
      return [x0 + (x1 - x0) * t, z0 + (z1 - z0) * t];
    };
    const postCount = spans; const bulbCount = spans * BULBS_PER_SPAN;
    if (posts.instanceMatrix.count < postCount) { posts.removeFromParent(); posts.dispose(); posts = instanced('가랜드 기둥', postGeometry, postMaterial, postCount); }
    if (bulbs.instanceMatrix.count < bulbCount) { bulbs.removeFromParent(); bulbs.dispose(); bulbs = instanced('가랜드 전구', bulbGeometry, bulbMaterial, bulbCount); }
    posts.count = postCount; bulbs.count = bulbCount; bulbBase = new Float32Array(bulbCount * 3);
    const wirePositions = new Float32Array(spans * 8 * 6); let wire = 0;
    const tops: Array<[number, number, number]> = [];
    for (let s = 0; s < spans; s++) {
      const [x, z] = pointAt((s / spans) * perimeter); const ground = sampleHeight(x, z);
      tops.push([x, ground + GARLAND_HEIGHT, z]);
      matrix.compose(position.set(x, ground + GARLAND_HEIGHT / 2, z), rotation.identity(), scale.set(1, GARLAND_HEIGHT, 1));
      posts.setMatrixAt(s, matrix);
    }
    for (let s = 0; s < spans; s++) {
      const a = tops[s]!; const b = tops[(s + 1) % spans]!;
      const at = (t: number, out: Vector3) => out.set(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - GARLAND_SAG * 4 * t * (1 - t), a[2] + (b[2] - a[2]) * t);
      for (let k = 0; k < 8; k++) {
        at(k / 8, position); wirePositions.set([position.x, position.y, position.z], wire); wire += 3;
        at((k + 1) / 8, position); wirePositions.set([position.x, position.y, position.z], wire); wire += 3;
      }
      for (let k = 0; k < BULBS_PER_SPAN; k++) {
        const i = s * BULBS_PER_SPAN + k; at((k + 0.5) / BULBS_PER_SPAN, position);
        bulbBase[i * 3] = position.x; bulbBase[i * 3 + 1] = position.y - 0.08; bulbBase[i * 3 + 2] = position.z;
        matrix.compose(position.set(bulbBase[i * 3]!, bulbBase[i * 3 + 1]!, bulbBase[i * 3 + 2]!), rotation.identity(), scale.set(1, 1, 1));
        bulbs.setMatrixAt(i, matrix);
      }
    }
    posts.instanceMatrix.needsUpdate = true; bulbs.instanceMatrix.needsUpdate = true;
    wires.geometry.dispose(); wires.geometry = new BufferGeometry();
    wires.geometry.setAttribute('position', new Float32BufferAttribute(wirePositions, 3));
    paintBulbs(0);
  }

  function relayoutRainbow() {
    if (rainbow) { rainbow.removeFromParent(); rainbow.geometry.dispose(); rainbow = null; }
    // Sized so the whole arch stays inside the isometric orthographic frustum (half height ≈ 0.52 × size).
    rainbow = new Mesh(rainbowGeometry(size * 0.38), rainbowMaterial); rainbow.name = '무지개 아치';
    rainbow.castShadow = false; rainbow.receiveShadow = false; rainbow.frustumCulled = false;
    rainbowGroup.add(rainbow);
    rainbowGroup.position.set(-size * 0.18, -0.4, -size * 0.18); rainbowGroup.rotation.set(0, Math.atan2(24, 30), 0);
  }

  function paintBulbs(time: number) {
    const glow = lighting === 'evening' ? 3.2 : 1.35;
    for (let i = 0; i < bulbs.count; i++) {
      const wave = 0.55 + 0.45 * Math.sin(time * 3.2 - i * 0.55);
      bulbs.setColorAt(i, tint.set(RAINBOW[i % RAINBOW.length]!).multiplyScalar(glow * (animating ? wave : 1)));
    }
    if (bulbs.instanceColor) bulbs.instanceColor.needsUpdate = true;
  }

  function placeSparkles(time: number) {
    const bright = lighting === 'evening' ? 1.25 : 1.05;
    for (let i = 0; i < sparkles.count; i++) {
      const phase = sparkleSeeds[i * 5 + 3]!; const speed = sparkleSeeds[i * 5 + 4]!;
      const twinkle = 0.35 + 0.65 * Math.abs(Math.sin(time * 2.4 * speed + phase));
      position.set(sparkleSeeds[i * 5]! + Math.sin(time * 0.4 + phase) * 0.35, sparkleSeeds[i * 5 + 1]! + Math.sin(time * speed + phase) * 0.25, sparkleSeeds[i * 5 + 2]! + Math.cos(time * 0.35 + phase) * 0.35);
      rotation.setFromAxisAngle(axisY, time * speed + phase);
      matrix.compose(position, rotation, scale.setScalar(twinkle * bright));
      sparkles.setMatrixAt(i, matrix);
    }
    sparkles.instanceMatrix.needsUpdate = true;
  }

  function placeHearts(time: number) {
    for (let i = 0; i < HEARTS; i++) {
      const phase = heartSeeds[i * 5 + 3]!; const lift = heartSeeds[i * 5 + 4]!;
      const y = 1.5 + ((heartSeeds[i * 5 + 1]! - 1.5 + time * lift) % 8.5);
      position.set(heartSeeds[i * 5]! + Math.sin(time * 0.8 + phase) * 0.45, y, heartSeeds[i * 5 + 2]!);
      rotation.setFromAxisAngle(axisY, Math.atan2(24, 30) + Math.sin(time * 1.1 + phase) * 0.6);
      matrix.compose(position, rotation, scale.setScalar(0.62 + 0.08 * Math.sin(time * 2.2 + phase)));
      hearts.setMatrixAt(i, matrix);
    }
    hearts.instanceMatrix.needsUpdate = true;
  }

  function placeBalloons(time: number) {
    const lines = strings.geometry.getAttribute('position') as Float32BufferAttribute;
    for (let i = 0; i < balloons.count; i++) {
      const ax = balloonSeeds[i * 6]!; const ground = balloonSeeds[i * 6 + 1]!; const az = balloonSeeds[i * 6 + 2]!;
      const angle = balloonSeeds[i * 6 + 3]!; const height = balloonSeeds[i * 6 + 4]!; const phase = balloonSeeds[i * 6 + 5]!;
      const sway = Math.sin(time * 0.9 + phase) * 0.12;
      position.set(ax + Math.cos(angle) * (0.45 + sway), ground + height + Math.sin(time * 1.3 + phase) * 0.12, az + Math.sin(angle) * (0.45 - sway));
      rotation.setFromAxisAngle(axisY, angle);
      matrix.compose(position, rotation, scale.set(0.34, 0.41, 0.34));
      balloons.setMatrixAt(i, matrix);
      lines.setXYZ(i * 2, ax, ground + 0.04, az); lines.setXYZ(i * 2 + 1, position.x, position.y - 0.4, position.z);
    }
    balloons.instanceMatrix.needsUpdate = true; lines.needsUpdate = true;
  }

  function placeFireworks(delta: number) {
    const show = animating && lighting === 'evening';
    fireworks.visible = show;
    if (!show) return;
    const random = fireworkRandom;
    let index = 0;
    for (const burst of bursts) {
      if (burst.delay > 0) { burst.delay -= delta; }
      else {
        burst.age += delta;
        if (burst.age >= FIREWORK_LIFE) {
          burst.age = 0; burst.delay = 0.35 + random() * 0.9;
          burst.x = (random() * 2 - 1) * size * 0.3; burst.y = 6.5 + random() * 3.5; burst.z = (random() * 2 - 1) * size * 0.3;
          burst.hue.set(PARTY[Math.floor(random() * PARTY.length)]!);
        }
      }
      const t = burst.delay > 0 ? -1 : burst.age; const fade = t < 0 ? 0 : Math.max(0, 1 - t / FIREWORK_LIFE);
      for (let p = 0; p < FIREWORK_PARTICLES; p++, index++) {
        if (t < 0) { matrix.makeScale(0, 0, 0); fireworks.setMatrixAt(index, matrix); continue; }
        const drag = 1 - Math.exp(-2.2 * t);
        position.set(burst.x + fireworkDirections[p * 3]! * drag, burst.y + fireworkDirections[p * 3 + 1]! * drag - 0.5 * 1.2 * t * t, burst.z + fireworkDirections[p * 3 + 2]! * drag);
        matrix.compose(position, rotation.identity(), scale.setScalar(0.5 + fade * 1.1));
        fireworks.setMatrixAt(index, matrix);
        fireworks.setColorAt(index, tint.copy(burst.hue).multiplyScalar(2.1 * fade + 0.25));
      }
    }
    fireworks.instanceMatrix.needsUpdate = true;
    if (fireworks.instanceColor) fireworks.instanceColor.needsUpdate = true;
  }

  function placeConfetti(delta: number): boolean {
    if (confettiAge >= CONFETTI_LIFE) return false;
    confettiAge += delta;
    if (confettiAge >= CONFETTI_LIFE) { confetti.count = 0; return true; }
    const shrink = Math.min(1, (CONFETTI_LIFE - confettiAge) * 2);
    for (let i = 0; i < confetti.count; i++) {
      const s = i * 8;
      const vy = confettiState[s + 4]! - GRAVITY * delta;
      const x = confettiState[s]! + confettiState[s + 3]! * delta;
      const y = confettiState[s + 1]! + vy * delta;
      const z = confettiState[s + 2]! + confettiState[s + 5]! * delta;
      const angle = confettiState[s + 6]! + confettiState[s + 7]! * delta;
      confettiState[s] = x; confettiState[s + 1] = y; confettiState[s + 2] = z; confettiState[s + 4] = vy; confettiState[s + 6] = angle;
      spin.setFromAxisAngle(confettiAxis, angle);
      matrix.compose(position.set(x, Math.max(y, 0.05), z), spin, scale.setScalar(shrink));
      confetti.setMatrixAt(i, matrix);
    }
    confetti.instanceMatrix.needsUpdate = true;
    return true;
  }

  function place(time: number, delta: number) {
    placeSparkles(time); placeHearts(time); placeBalloons(time); paintBulbs(time); placeFireworks(delta);
  }

  function applyVisibility() {
    root.visible = enabled;
    rainbowGroup.visible = enabled && lighting === 'day';
    heartMaterial.emissiveIntensity = lighting === 'evening' ? 0.85 : 0.35;
  }

  function layout(nextSize: number, nextQuality: RoomQuality) {
    size = nextSize; quality = nextQuality;
    relayoutSparkles(); relayoutHearts(); relayoutBalloons(); relayoutGarland(); relayoutRainbow();
    place(elapsed, 0); applyVisibility();
  }

  layout(size, quality);

  return {
    root,
    layout(nextSize: number, nextQuality: RoomQuality) {
      if (nextSize === size && nextQuality === quality) return false;
      layout(nextSize, nextQuality);
      return true;
    },
    /** Re-sample terrain heights for grounded decorations after sculpting. */
    refreshGround() { relayoutBalloons(); relayoutGarland(); place(elapsed, 0); },
    setLighting(next: RoomLighting) { lighting = next; applyVisibility(); place(elapsed, 0); },
    setEnabled(next: boolean) { enabled = next; applyVisibility(); if (!enabled) { confettiAge = Infinity; confetti.count = 0; } },
    /** Launch confetti at a world position; frames are requested until the burst settles. */
    burst(x: number, y: number, z: number) {
      if (!enabled) return;
      const random = seededRandom(Math.floor(x * 131 + z * 17 + elapsed * 1000));
      confetti.count = CONFETTI; confettiAge = 0;
      for (let i = 0; i < CONFETTI; i++) {
        const s = i * 8; const angle = random() * Math.PI * 2; const out = 1.2 + random() * 2.2;
        confettiState[s] = x; confettiState[s + 1] = y + 0.6; confettiState[s + 2] = z;
        confettiState[s + 3] = Math.cos(angle) * out; confettiState[s + 4] = 3.4 + random() * 2.6; confettiState[s + 5] = Math.sin(angle) * out;
        confettiState[s + 6] = random() * Math.PI; confettiState[s + 7] = (random() * 2 - 1) * 12;
      }
    },
    /**
     * Advances continuous decorations by `sceneryDelta` while `animate` and a confetti burst by `delta`. Returns true
     * while the burst still needs frames.
     */
    tick(delta: number, animate: boolean, sceneryDelta = delta): boolean {
      if (!enabled) return false;
      if (animate) {
        animating = true;
        if (sceneryDelta > 0) { elapsed += sceneryDelta; place(elapsed, sceneryDelta); }
      } else if (animating) {
        animating = false; place(elapsed, 0);
      }
      return placeConfetti(delta);
    },
    diagnostics(): FestivalDiagnostics {
      return {
        enabled, sparkles: sparkles.count, hearts: HEARTS, balloons: balloons.count, bulbs: bulbs.count,
        rainbow: rainbowGroup.visible, fireworks: fireworks.visible ? fireworks.count : 0, confetti: confetti.count,
      };
    },
    dispose() {
      root.removeFromParent();
      for (const mesh of [sparkles, hearts, balloons, posts, bulbs, fireworks, confetti]) mesh.dispose();
      if (rainbow) rainbow.geometry.dispose();
      strings.geometry.dispose(); wires.geometry.dispose();
      for (const geometry of geometries) geometry.dispose();
      for (const material of materials) material.dispose();
    },
  };
}

export type RoomFestival = ReturnType<typeof createRoomFestival>;
