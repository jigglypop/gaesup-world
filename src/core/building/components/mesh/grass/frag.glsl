precision highp float;
uniform sampler2D map;
uniform sampler2D alphaMap;
uniform vec3 tipColor;
uniform vec3 bottomColor;
varying vec2 vUv;
varying float frc;
varying float vCluster;
varying float vDryness;
varying float vShade;

void main() {
  float alpha = texture2D(alphaMap, vUv).r;
  if(alpha < 0.15)
    discard;
  vec3 warmBottom = vec3(0.30, 0.23, 0.08);
  vec3 warmTip = vec3(0.80, 0.74, 0.34);
  vec3 coolBottom = vec3(0.18, 0.31, 0.12);
  vec3 coolTip = vec3(0.63, 0.82, 0.42);
  vec3 lushBottom = mix(bottomColor, coolBottom, vCluster * 0.35);
  vec3 lushTip = mix(tipColor, coolTip, vCluster * 0.28);
  vec3 dryBottom = mix(lushBottom, warmBottom, vDryness * 0.85);
  vec3 dryTip = mix(lushTip, warmTip, vDryness);

  vec3 bladeGradient = mix(dryBottom, dryTip, smoothstep(0.0, 1.0, frc));
  vec3 tex = texture2D(map, vUv).rgb;
  float rib = 1.0 - smoothstep(0.0, 0.52, abs(vUv.x - 0.5));
  vec3 color = mix(bladeGradient * 0.72, tex * bladeGradient, 0.62);
  color *= mix(0.9, 1.1, vCluster);
  color *= mix(1.0, 0.82, vDryness * 0.35);
  color *= mix(0.94, 1.05, rib);
  color *= vShade;

  vec4 col = vec4(color, 1.0);
  col.rgb = col.rgb / (col.rgb + vec3(1.0));
  col.rgb = pow(col.rgb, vec3(1.0 / 2.2));

  gl_FragColor = col;
}