precision highp float;

uniform sampler2D map;
uniform float transmission;
uniform float envMapIntensity;

varying vec2 vUv;

void main() {
    vec4 texColor = texture2D(map, vUv);
    float alpha = texColor.a * (1.0 - transmission);
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(texColor.rgb * envMapIntensity, alpha);
}