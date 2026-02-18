precision highp float;

uniform float time;
uniform float windStrength;

varying vec2 vUv;

void main() {
    vUv = uv;
    vec3 pos = position;

    float fixGradient = uv.x * uv.x;

    // Per-instance phase offset from world position for variation
    float phase = 0.0;
    #ifdef USE_INSTANCING
      phase = instanceMatrix[3][0] * 0.3 + instanceMatrix[3][2] * 0.5;
    #endif

    float wave1 = sin(uv.x * 4.0 + time * 1.0 + phase) * 0.12;
    float wave2 = sin(uv.x * 7.0 + time * 1.7 + 1.3 + phase * 0.7) * 0.06;
    float wave3 = sin(uv.x * 13.0 + time * 2.9 + 2.7 + phase * 1.3) * 0.025;

    float verticalRipple = sin(uv.y * 6.0 + time * 0.8 + phase * 0.4) * 0.02 * fixGradient;

    float displacement = (wave1 + wave2 + wave3) * fixGradient * windStrength;
    pos.z += displacement + verticalRipple;
    pos.y -= fixGradient * 0.03 * windStrength;

    vec4 mvPosition = vec4(pos, 1.0);
    #ifdef USE_INSTANCING
      mvPosition = instanceMatrix * mvPosition;
    #endif
    gl_Position = projectionMatrix * modelViewMatrix * mvPosition;
}