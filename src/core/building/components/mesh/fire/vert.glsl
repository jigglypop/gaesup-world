varying vec2 vUv;

void main() {
  vUv = uv;

  // Y-locked billboard: face camera horizontally, stay upright
  vec3 right = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
  vec3 up = vec3(0.0, 1.0, 0.0);

  vec3 billboarded = right * position.x + up * position.y;

  vec4 center = modelMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  center.xyz += billboarded;

  gl_Position = projectionMatrix * viewMatrix * center;
}
