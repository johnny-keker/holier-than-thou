import * as matrix from '../utils/matrices.js';
import Mouse from '../utils/mouse.js';
import * as videoTexture from './video-texture.js';

let gl;
let progInfo;
let buffers;
let currX = 0;
let currZ = 0;
let rotations = [0, 0, 0];
let texture;
let video;
let phase = 0;

async function main() {
  const canvas = document.querySelector(".gl-canvas");
  // GL context init
  gl = canvas.getContext("webgl");
  
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

  progInfo = await initShader(
    gl, 
    'shaders/vertex_shader.glsl',
    'shaders/fragment_shader.glsl'
  );

  buffers = await initBuffers(gl);

  renderScene();
  document.addEventListener('keypress', (e) => {
    console.log(e.charCode);
    switch (e.charCode) {
      case 1094:
      case 119:
        currZ += 1;
        break;
      case 1099:
      case 115:
        currZ -= 1;
        break;
      case 1092:
      case 97:
        currX += 1;
        break;
      case 1074:
      case 100:
        currX -= 1;
        break;
      default:
        return;
    }
  }
  );

  document.addEventListener('input', () => redrawScene());
  new Mouse(canvas, (radX, radY) => {
    let x = matrix.radToDeg(radX);
    let y = matrix.radToDeg(radY);
    if (x < -180) x = 180;
    else if (x > 180) x = -180;
    if (y < -180) y = 180;
    else if (y > 180) y = -180;
    document.querySelector('.slider__x').value = x;    
    document.querySelector('.slider__y').value = y;
    redrawScene();
  });
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
      texcoord: gl.getAttribLocation(program, 'aTexcoord'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(program, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(program, 'uModelViewMatrix'),
      texture: gl.getUniformLocation(program, 'uTexture'),
      phase: gl.getUniformLocation(program, 'uPhase'),
    },
  };

  return programInfo;
}

async function loadShader(gl, type, filepath) {
  const programText = await (await fetch(filepath)).text();
  const shader = gl.createShader(type);

  console.log(programText);

  gl.shaderSource(shader, programText);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('Smth gone wrong - cant compile the shader ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

async function initBuffers(gl) {
  const x = 100;
  const y = 100;
  var positions = new Float32Array(x * y * 18);
  var texcoors = new Float32Array(x * y * 12);
  var filledPos = 0;
  var filledCoors = 0;
  for (var i = -x / 2; i < x / 2; i++) {
    for (var j = -y / 2; j < y / 2; j++) {
      positions.set(generateSquare(i, j), filledPos);
      texcoors.set(generateTexcoor(i, j), filledCoors);
      filledPos += 18;
      filledCoors += 12;
    }
  };
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

  const textureBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, texcoors, gl.STATIC_DRAW);
  /*
  const textureBlob = await fetch('../textures/00.jpg').then((r) => r.blob());
  const textureBitmap = await window.createImageBitmap(textureBlob);
  var texture = gl.createTexture();

  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureBitmap);
  gl.generateMipmap(gl.TEXTURE_2D);
  */
  texture = videoTexture.initVideoTexture(gl);
  video = videoTexture.setUp('rave');
  return { position: positionBuffer, texcoord: textureBuffer, texture: texture, numItems: x * y * 6 };
}

function renderScene() {
  phase += 0.1;
  rotations[2] += 0.1;
  if (rotations[2] > 180) rotations[2] = -180;
  document.querySelector('.slider__z').value = rotations[2];

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
  const zFar = 200.0;
  var projectionMatrix = new Float32Array(
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
  );


  var modelViewMatrix = new Float32Array(
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
  );

  if (videoTexture.copyVideo)
    videoTexture.updateTexture(gl, texture, video);
  projectionMatrix = matrix.perspective(projectionMatrix,
    fieldOfView,
    aspect,
    zNear,
    zFar);
  modelViewMatrix = matrix.translate(modelViewMatrix, currX, 0, -100.0 + currZ);
  modelViewMatrix = matrix.rotate(modelViewMatrix, rotations);
  gl.setUniformLocation
  {
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(
      progInfo.attribLocations.vertexPosition,
      numComponents,
      type,
      normalize,
      stride,
      offset);
    gl.enableVertexAttribArray(progInfo.attribLocations.vertexPosition);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.texcoord);
    gl.vertexAttribPointer(
      progInfo.attribLocations.texcoord,
      2,
      gl.FLOAT,
      false,
      stride,
      offset);
    gl.enableVertexAttribArray(progInfo.attribLocations.texcoord);
  }

  gl.useProgram(progInfo.program);

  gl.uniformMatrix4fv(
    progInfo.uniformLocations.projectionMatrix,
    false,
    projectionMatrix);
  gl.uniformMatrix4fv(
    progInfo.uniformLocations.modelViewMatrix,
    false,
    modelViewMatrix);
  gl.uniform1f(progInfo.uniformLocations.phase, phase);
  {
    const offset = 0;
    const vertexCount = buffers.numItems;
    gl.drawArrays(gl.TRIANGLES, offset, vertexCount);
  }
  requestAnimationFrame(renderScene);
}

function redrawScene() {
  rotations[0] = parseFloat(document.querySelector('.slider__x').value);
  rotations[1] = parseFloat(document.querySelector('.slider__y').value);
  rotations[2] = parseFloat(document.querySelector('.slider__z').value);
}

function createTextureMenu() {
  var container = document.querySelector('.texture-box');

  for (var i = 0; i < 2; i++) {
    var radio = document.createElement('input');
    radio.type = 'radio';
    radio.class = 'texture-selector';
    if (i < 10)
      radio.value = '../textures/0' + i + '.jpg';
    else
      radio.value = '../textures/' + i + '.jpg';
    radio.name = 'texture';
    radio.addEventListener('change', () => {
      alert(radio.value);
    });
    container.appendChild(radio);
  }
}

function generateSquare(x, y) {
  return [
    // left triangle
    x, y, 0.0,
    x + 1.0, y, 0.0,
    x, y + 1.0, 0.0,
    // right triangle
    x + 1.0, y + 1.0, 0.0,
    x, y + 1.0, 0.0,
    x + 1.0, y, 0.0,
  ]
}

function generateTexcoor(x, y) {
  x /= 100;
  y /= 100;
  x += 0.5;
  y += 0.5;
  return [
    x, y,
    x + 0.01, y,
    x, y + 0.01,

    x + 0.01, y + 0.01,
    x, y + 0.01,
    x + 0.01, y
  ]
}
document.addEventListener('DOMContentLoaded', main);
