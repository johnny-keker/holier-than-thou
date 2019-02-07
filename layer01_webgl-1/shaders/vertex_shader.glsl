
// input vertex position
attribute vec4 aVertexPosition;
attribute vec3 aVertexColor;

// provided
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

varying lowp vec3 vColor;

void main() {
  vColor = aVertexColor;
  gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
}
