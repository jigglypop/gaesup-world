varying vec2 vUv;
uniform float seed;
uniform float lean;

void main() {
  vUv = uv;

  // Y-locked billboard: face camera horizontally, stay upright
  vec3 right = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
  vec3 up = vec3(0.0, 1.0, 0.0);

  float bend = lean * pow(clamp(uv.y, 0.0, 1.0), 1.35) * (0.35 + uv.y * 0.65);
  float wobble = sin((uv.y * 6.0 + seed * 5.73) + position.y * 1.15) * 0.035 * uv.y;
  float lift = sin(uv.x * 3.14159 + seed * 3.7) * 0.018 * uv.y;

  vec3 billboarded = right * (position.x + bend + wobble) + up * (position.y + lift);

  vec4 center = modelMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  center.xyz += billboarded;

  gl_Position = projectionMatrix * viewMatrix * center;
}
