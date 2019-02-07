import * as matrix from '../utils/matrices.js';
import Mouse from '../utils/mouse.js';

async function main() {
  const canvas = document.querySelector(".gl-canvas");
  // GL context init
  const gl = canvas.getContext("webgl");
  
  var x = 0, y = 0;
  var mouseDown = false;

  if (gl == null) {
    alert("Sorry, buddy - your browser or machine dont support WEB-GL(");
    return;
  }

  // clear color is black now
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  // fill the color buffer with the clear color
  gl.clear(gl.COLOR_BUFFER_BIT);

  const progInfo = await initShader(
    gl, 
    'shaders/vertex_shader.glsl',
    'shaders/fragment_shader.glsl'
  );

  const buffers = initBuffers(gl);

  renderScene(gl, progInfo, buffers, [0, 0, 0]);

  new Mouse(canvas, (x, y) => {
    renderScene(gl, progInfo, buffers, [0, 0, document.querySelector('.slider__z').value], x, y);
  });

  document.addEventListener('input', () => redrawScene(gl, progInfo, buffers));
}

async function initShader(gl, vertex, fragment) {
  // init shaders
  const vertexShader = await loadShader(gl, gl.VERTEX_SHADER, vertex);
  const fragmentShader = await loadShader(gl, gl.FRAGMENT_SHADER, fragment);

  // init program
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    alert('Smth gone wrong - cant create shader program(');
    return null;
  }

  const programInfo = {
    program: program,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(program, 'aVertexPosition'),
      vertexColor: gl.getAttribLocation(program, 'aVertexColor'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(program, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(program, 'uModelViewMatrix'),
    },
  };

  return programInfo;
}

async function loadShader(gl, type, filepath) {
  const programText = await (await fetch(filepath)).text();
  const shader = gl.createShader(type);

  gl.shaderSource(shader, programText);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('Smth gone wrong - cant compile the shader ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function initBuffers(gl) {
  const positionBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  const positions = [
    // first face
    0.0, 0.0, 2.0,
    1.0, -1.0, 0.0,
    1.0, 1.0, 0.0,

    // second face
    0.0, 0.0, 2.0,
    1.0, -1.0, 0.0,
    -1.0, -1.0, 0.0,

    // third face
    0.0, 0.0, 2.0,
    -1.0, -1.0, 0.0,
    -1.0, 1.0, 0.0,

    // fourth face
    0.0, 0.0, 2.0,
    -1.0, 1.0, 0.0,
    1.0, 1.0, 0.0,

    // bottom first triangle
    -1.0, 1.0, 0.0,
    1.0, -1.0, 0.0,
    1.0, 1.0, 0.0,

    // bottom second triangle
    -1.0, 1.0, 0.0,
    1.0, -1.0, 0.0,
    -1.0, -1.0, 0.0,
  ];

  //for (var i = 0; i < positions.lehgth; i++)
  //positions[i] = positions[i] / 4;


  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array(positions),
    gl.STATIC_DRAW);

  const colorBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

  const colors = [
    216, 219, 226,
    216, 219, 226,
    216, 219, 226,
  
    169, 188, 208,
    169, 188, 208,
    169, 188, 208,

    88, 164, 176,
    88, 164, 176,
    88, 164, 176,

    53, 63, 81,
    53, 63, 81,
    53, 63, 81,

    27, 27, 30,
    27, 27, 30,
    27, 27, 30,

    27, 27, 30,
    27, 27, 30,
    27, 27, 30,
  ];

  gl.bufferData(gl.ARRAY_BUFFER,
    new Uint8Array(colors),
    gl.STATIC_DRAW);

  return { position: positionBuffer, color: colorBuffer };
}

function renderScene(gl, programInfo, buffers, rotations, radX = null, radY = null) {
  // init
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clearDepth(1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // creation of perspective matrix
  // field of view - 45 degrees
  const fieldOfView = 45;
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  var projectionMatrix = new Float32Array(
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
  );


  var modelViewMatrix = new Float32Array(
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
  );

  projectionMatrix = matrix.perspective(projectionMatrix,
    fieldOfView,
    aspect,
    zNear,
    zFar);

  modelViewMatrix = matrix.translate(modelViewMatrix, -0.0, 0.0, -6.0);
  modelViewMatrix = matrix.rotate(modelViewMatrix, rotations, [radX, radY]);
  //mat4.rotate(modelViewMatrix, modelViewMatrix, degToRad(rotations[0]), [1, 0, 0]);
  //mat4.rotate(modelViewMatrix, modelViewMatrix, degToRad(rotations[1]), [0, 1, 0]);
  //mat4.rotate(modelViewMatrix, modelViewMatrix, degToRad(rotations[2]), [0, 0, 1]);
  gl.setUniformLocation
  {
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexPosition,
      numComponents,
      type,
      normalize,
      stride,
      offset);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexColor,
      3,
      gl.UNSIGNED_BYTE,
      true,
      stride,
      offset);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
  }

  gl.useProgram(programInfo.program);

  gl.uniformMatrix4fv(
    programInfo.uniformLocations.projectionMatrix,
    false,
    projectionMatrix);
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.modelViewMatrix,
    false,
    modelViewMatrix);

  {
    const offset = 0;
    const vertexCount = 18;
    gl.drawArrays(gl.TRIANGLES, offset, vertexCount);
  }
}



function redrawScene(gl, progInfo, buffers) {
  var x = document.querySelector('.slider__x').value;
  var y = document.querySelector('.slider__y').value;
  var z = document.querySelector('.slider__z').value;
  
  renderScene(gl, progInfo, buffers, [x, y, z]);
}

document.addEventListener('DOMContentLoaded', main);
