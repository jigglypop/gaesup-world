precision highp float;
attribute vec3 offset;
attribute vec4 orientation;
attribute float halfRootAngleSin;
attribute float halfRootAngleCos;
attribute float stretch;
uniform float time;
uniform float windScale;
uniform float bladeHeight;
uniform vec3 trampleCenter;
uniform float trampleRadius;
uniform float trampleStrength;
varying vec2 vUv;
varying float frc;
varying float vCluster;
varying float vDryness;
varying float vShade;

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}
vec2 mod289(vec2 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}
vec3 permute(vec3 x) {
  return mod289(((x * 34.0) + 1.0) * x);
}

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

vec3 rotateVectorByQuaternion(vec3 v, vec4 q) {
  return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v);
}

void main() {
  frc = position.y / float(bladeHeight);
  float clusterNoise = snoise(offset.xz * 0.11 + vec2(3.7, -8.2));
  float dryNoise = snoise(offset.xz * 0.18 + vec2(-5.4, 12.6));
  float noise = 1.0 - snoise(vec2((time - offset.x / 50.0), (time - offset.z / 50.0)));
  vec4 direction = vec4(0.0, halfRootAngleSin, 0.0, halfRootAngleCos);
  vec4 tiltAxis = vec4(-orientation.z, 0.0, orientation.x, orientation.w);
  vec4 bent = normalize(mix(direction, tiltAxis, frc));
  vec3 vPosition = vec3(position.x, position.y + position.y * stretch, position.z);
  vPosition = rotateVectorByQuaternion(vPosition, bent);

  float windAngle = noise * 0.3 * windScale;
  vec4 windQuat = vec4(sin(windAngle), 0.0, -sin(windAngle), cos(windAngle));
  vPosition = rotateVectorByQuaternion(vPosition, windQuat);

  // Player trampling: blades within `trampleRadius` of `trampleCenter` get
  // pushed down (negative Y) and tilted away from the centre. The push falls
  // off smoothly so we don't get a hard ring of flattened grass.
  if (trampleRadius > 0.0001) {
    vec2 toCenter = offset.xz - trampleCenter.xz;
    float distXZ = length(toCenter);
    float falloff = clamp(1.0 - distXZ / trampleRadius, 0.0, 1.0);
    if (falloff > 0.0) {
      float push = falloff * falloff * trampleStrength;
      vPosition.y *= mix(1.0, 0.18, push);
      vec2 dir = distXZ > 0.0001 ? toCenter / distXZ : vec2(0.0);
      vPosition.x += dir.x * push * 0.45 * frc;
      vPosition.z += dir.y * push * 0.45 * frc;
    }
  }

  vCluster = clusterNoise * 0.5 + 0.5;
  vDryness = clamp((dryNoise * 0.5 + 0.5) * 0.7 + (1.0 - stretch) * 0.45, 0.0, 1.0);
  vShade = clamp(0.82 + noise * 0.08 + orientation.w * 0.06, 0.72, 1.1);
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(offset + vPosition, 1.0);
}