varying vec2 vUv;
uniform float time;
uniform float intensity;

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

  // Flame shape: narrower at top, wider at base
  float dist = abs(uv.x - 0.5) * 2.0;
  float shape = 1.0 - smoothstep(0.0, 0.3 + uv.y * 0.5, dist);

  // Animated noise for turbulence
  float n1 = fbm(vec2(uv.x * 5.0, uv.y * 6.0 - time * 2.0));
  float n2 = fbm(vec2(uv.x * 8.0 + 10.0, uv.y * 10.0 - time * 3.5));

  float fire = shape * (1.0 - uv.y);
  fire = smoothstep(0.0, 0.4, fire + n1 * 0.4 - uv.y * 0.2);
  fire += n2 * 0.08 * shape;
  fire = clamp(fire, 0.0, 1.0);

  // Flickering
  float flicker = 0.85 + 0.15 * noise(vec2(time * 5.0, 0.0));
  fire *= flicker;

  // Color gradient: white core -> yellow -> orange -> dark red
  vec3 col1 = vec3(1.0, 0.95, 0.5);
  vec3 col2 = vec3(1.0, 0.45, 0.0);
  vec3 col3 = vec3(0.7, 0.1, 0.0);

  vec3 color = mix(col3, col2, smoothstep(0.0, 0.4, fire));
  color = mix(color, col1, smoothstep(0.4, 0.7, fire));
  color = mix(color, vec3(1.0), smoothstep(0.8, 1.0, fire));

  float alpha = smoothstep(0.01, 0.1, fire) * intensity;

  if (alpha < 0.01) discard;

  gl_FragColor = vec4(color * intensity, alpha);
}
