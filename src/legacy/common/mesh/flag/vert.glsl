uniform float time;
varying vec2 vUv;

void main() {
    vUv = uv;
    float waveX = sin(uv.x * 5.0 + time * 1.0) * 0.05;
    float waveY = sin(uv.y * 5.0 + time * 1.0) * 0.025;
    vec3 pos = position;
    pos.z += waveX + waveY;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}