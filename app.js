function main() {
  const canvas = document.querySelector(".gl-canvas");
  // GL context init
  const gl = canvas.getContext("webgl");

  if (gl == null) {
    alert("Sorry, buddy - your browser or machine dont support WEB-GL(");
    return;
  }

  // clear color is black now
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  // fill the color buffer with the clear color
  gl.clear(gl.COLOR_BUFFER_BIT);
}
