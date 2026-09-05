varying vec2 vUv;
uniform float time;
uniform float intensity;
uniform float seed;
uniform float lean;
uniform float flare;
uniform vec3 tint;

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
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 3; i++) {
    v += a * noise(p);
    p = p * 2.1 + vec2(100.0);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = vUv;

  vec2 q = vec2(
    fbm(vec2(uv.x * 4.2 + seed * 5.1, uv.y * 5.8 - time * 1.5)),
    fbm(vec2(uv.x * 3.6 - seed * 3.3, uv.y * 4.6 + time * 0.6))
  );
  float n1 = fbm(uv * vec2(3.8, 5.6) + q * 1.5 + vec2(seed * 2.0, -time * 1.1));
  float n2 = noise(vec2(uv.y * 9.0 + seed * 11.0, time * 4.7 + seed * 17.0));

  float skew = lean * pow(uv.y, 1.2);
  float sway = (n1 - 0.5) * 0.28 * (1.0 - uv.y * 0.35);
  float x = (uv.x - 0.5) - skew + sway;
  float w = mix(0.46 * flare, 0.02, pow(uv.y, 0.72));

  float edgeTurb = q.x * 0.07 * uv.y;
  float body = 1.0 - smoothstep(w - edgeTurb, w + 0.06, abs(x));
  float tongue1 = 1.0 - smoothstep(w * 0.82, w * 0.82 + 0.06, abs(x + 0.12 + q.y * 0.08));
  float tongue2 = 1.0 - smoothstep(w * 0.68, w * 0.68 + 0.07, abs(x - 0.1 + q.x * 0.06));

  float baseGlow = 1.0 - smoothstep(0.1, 0.42, distance(uv, vec2(0.5 + skew * 0.1, 0.1)));
  float plume = max(body, max(tongue1 * 0.82, tongue2 * 0.68));

  float bite = smoothstep(0.55, 1.0, n1 + uv.y * 0.4);
  plume *= mix(1.0, 0.72, bite * smoothstep(0.2, 0.85, uv.y));
  plume *= 1.0 - smoothstep(0.8, 1.0, uv.y);
  plume = smoothstep(0.14, 0.9, plume + baseGlow * 0.38 + n1 * 0.2);

  float core = 1.0 - smoothstep(0.01, 0.14, abs(x));
  float fire = clamp(plume * (0.85 + 0.15 * n2), 0.0, 1.0);

  vec3 deepRed = vec3(0.35, 0.02, 0.0);
  vec3 ember   = vec3(0.65, 0.08, 0.01);
  vec3 orange  = vec3(1.0, 0.38, 0.04);
  vec3 golden  = vec3(1.0, 0.65, 0.18);
  vec3 hot     = vec3(1.0, 0.88, 0.55);
  vec3 white   = vec3(1.0, 0.97, 0.92);

  vec3 color = mix(deepRed, ember, smoothstep(0.02, 0.15, fire));
  color = mix(color, orange, smoothstep(0.12, 0.35, fire));
  color = mix(color, golden, smoothstep(0.28, 0.52, fire));
  color = mix(color, hot, smoothstep(0.45, 0.72, fire));
  color = mix(color, white, smoothstep(0.62, 1.0, fire * core));

  float trail = smoothstep(0.8, 1.0, n2 + n1 * 0.3)
    * smoothstep(0.18, 0.7, uv.y)
    * smoothstep(0.35, 0.0, abs(x));
  color += trail * vec3(1.0, 0.4, 0.06) * 0.4;

  float smokeY = smoothstep(0.75, 0.98, uv.y);
  float smoke = smokeY * q.x * 0.22 * smoothstep(0.28, 0.0, abs(x));
  color = mix(color, vec3(0.18, 0.14, 0.12), smoke);

  float alpha = smoothstep(0.06, 0.35, fire) * min(1.0, 0.5 + intensity * 0.26);
  alpha += trail * 0.15 + smoke * 0.3;

  if (alpha < 0.01) discard;

  gl_FragColor = vec4(color * tint * (0.62 + intensity * 0.48), alpha);
}
