varying vec2 vUv;
uniform float seed;
uniform float lean;
uniform float time;

void main() {
  vUv = uv;

  vec3 right = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
  vec3 up = vec3(0.0, 1.0, 0.0);
  float uy = clamp(uv.y, 0.0, 1.0);

  float sway = sin(time * 0.7 + seed * 3.14) * 0.04 * uy;
  float bend = lean * pow(uy, 1.35) * (0.35 + uy * 0.65);
  float wobble = sin((uy * 6.0 + seed * 5.73) + position.y * 1.15) * 0.03 * uy;
  float lift = sin(uv.x * 3.14159 + seed * 3.7) * 0.015 * uy;

  vec3 billboarded = right * (position.x + bend + wobble + sway) + up * (position.y + lift);

  vec4 center = modelMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  center.xyz += billboarded;

  gl_Position = projectionMatrix * viewMatrix * center;
}
