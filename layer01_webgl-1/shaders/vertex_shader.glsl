precision mediump float;
// input vertex position
attribute vec4 aVertexPosition;
attribute vec2 aTexcoord;

// provided
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

varying vec2 vTexcoord;

void main() {
  vTexcoord = aTexcoord;
  gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
}
