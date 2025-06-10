precision highp float;
uniform sampler2D map;
uniform sampler2D alphaMap;
uniform vec3 tipColor;
uniform vec3 bottomColor;
varying vec2 vUv;
varying float frc;

void main() {
  float alpha = texture2D(alphaMap, vUv).r;
  if(alpha < 0.15)
    discard;
  vec4 col = texture2D(map, vUv);
  col = mix(vec4(bottomColor, 1.0), col, frc);
  col = mix(col, vec4(tipColor, 1.0), 1.0 - frc);

  col.rgb = col.rgb / (col.rgb + vec3(1.0));
  col.rgb = pow(col.rgb, vec3(1.0 / 2.2));

  gl_FragColor = col;
}