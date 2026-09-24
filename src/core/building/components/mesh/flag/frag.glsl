precision highp float;

uniform sampler2D map;
uniform float envMapIntensity;

const float CLOTH_OPACITY = 0.95;

varying vec2 vUv;

void main() {
    vec4 texColor = texture2D(map, vUv);
    float alpha = texColor.a * CLOTH_OPACITY;
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(texColor.rgb * envMapIntensity, alpha);
}