varying vec2 vUv;
uniform float time;
uniform float intensity;
uniform float seed;
uniform float lean;
uniform float flare;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = p * 2.0 + vec2(100.0);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = vUv;

  float n1 = fbm(vec2(uv.x * 3.8 + seed * 7.3, uv.y * 5.6 - time * (1.6 + flare * 0.18)));
  float n2 = fbm(vec2(uv.x * 7.9 - seed * 4.1, uv.y * 10.8 - time * 2.8));
  float n3 = noise(vec2(uv.y * 9.0 + seed * 11.0, time * 4.7 + seed * 17.0));
  float n4 = fbm(vec2(uv.x * 12.5 + seed * 2.7, uv.y * 8.0 - time * 2.2));

  float skew = lean * pow(uv.y, 1.2);
  float sway = (n1 - 0.5) * 0.22 * (1.0 - uv.y * 0.35);
  float x = (uv.x - 0.5) - skew + sway;
  float width = mix(0.46 * flare, 0.05, pow(uv.y, 0.82));

  float centerBody = 1.0 - smoothstep(width, width + 0.09 + n2 * 0.05, abs(x));
  float leftTongue = 1.0 - smoothstep(width * 0.84, width * 0.84 + 0.08, abs(x + 0.12 + (n2 - 0.5) * 0.08));
  float rightTongue = 1.0 - smoothstep(width * 0.72, width * 0.72 + 0.08, abs(x - 0.10 + (n4 - 0.5) * 0.08));

  float bite = smoothstep(0.60, 1.0, n4 + uv.y * 0.38);
  float baseGlow = 1.0 - smoothstep(0.14, 0.52, distance(uv, vec2(0.5 + skew * 0.12, 0.15)));
  float plume = max(centerBody, max(leftTongue * 0.82, rightTongue * 0.76));
  plume *= mix(1.0, 0.78, bite * smoothstep(0.22, 0.9, uv.y));
  plume *= 1.0 - smoothstep(0.84, 1.0, uv.y);
  plume = smoothstep(0.18, 0.92, plume + baseGlow * 0.30 + n1 * 0.18 + n2 * 0.10 * (1.0 - uv.y));

  float emberTrail = smoothstep(0.84, 1.0, n3 + n2 * 0.35)
    * smoothstep(0.14, 0.78, uv.y)
    * smoothstep(0.42, 0.0, abs(x));
  float core = 1.0 - smoothstep(0.03, 0.18 + n1 * 0.05, abs(x));
  float fire = clamp(plume * (0.88 + 0.12 * n3), 0.0, 1.0);

  vec3 ember = vec3(0.58, 0.08, 0.01);
  vec3 flame = vec3(1.0, 0.42, 0.04);
  vec3 hot = vec3(1.0, 0.84, 0.48);
  vec3 whiteHot = vec3(1.0, 0.97, 0.92);

  vec3 color = mix(ember, flame, smoothstep(0.08, 0.45, fire));
  color = mix(color, hot, smoothstep(0.38, 0.74, fire));
  color = mix(color, whiteHot, smoothstep(0.62, 1.0, fire * core));
  color += emberTrail * vec3(1.0, 0.45, 0.08) * 0.45;

  float alpha = smoothstep(0.10, 0.42, fire) * min(1.0, 0.45 + intensity * 0.22);
  alpha += emberTrail * 0.16;

  if (alpha < 0.01) discard;

  gl_FragColor = vec4(color * (0.65 + intensity * 0.45), alpha);
}
