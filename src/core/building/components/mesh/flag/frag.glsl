precision highp float;

uniform sampler2D map;
uniform float transmission;
uniform float roughness;
uniform float envMapIntensity;

varying vec2 vUv;

void main() {
    vec4 texColor = texture2D(map, vUv);
    gl_FragColor = texColor;
    gl_FragColor.a *= 1.0 - transmission;
    gl_FragColor.rgb *= envMapIntensity;
}