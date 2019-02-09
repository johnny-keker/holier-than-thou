precision mediump float;

varying vec2 vTexcoord;

uniform sampler2D uTexture;

void main() {
  gl_FragColor = texture2D(uTexture, vTexcoord);
  //gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
}
