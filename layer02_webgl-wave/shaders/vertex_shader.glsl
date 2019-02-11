precision mediump float;
// input vertex position
attribute vec4 aVertexPosition;
attribute vec2 aTexcoord;

// provided
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform float uPhase;

varying vec2 vTexcoord;

void main() {
  vec4 pos = aVertexPosition;
  pos.z = 2.0 * sin(0.6 * pos.x + uPhase); //* sin(0.6 * pos.y + uPhase);
  vTexcoord = aTexcoord;
  gl_Position = uProjectionMatrix * uModelViewMatrix * pos;
}