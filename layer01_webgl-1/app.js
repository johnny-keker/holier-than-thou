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

  renderScene(gl, progInfo, buffers, [0, 0, 0], [0, 0, 0]);

  /*new Mouse(canvas, (x, y) => {
    renderScene(gl, progInfo, buffers, [0, 0, document.querySelector('.slider__z').value], x, y);
  });*/

  //createTextureMenu();
  var currX = 0;
  var currZ = 0;
  document.addEventListener('keypress', (e) => {
    console.log(e.charCode);
    switch (e.charCode) {
      case 1094:
      case 119:
        currZ += 0.5;
        break;
      case 1099:
      case 115:
        currZ -= 0.5;
        break;
      case 1092:
      case 97:
        currX += 0.5;
        break;
      case 1074:
      case 100:
        currX -= 0.5;
        break;
      default:
        return;
    }
    redrawScene(gl, progInfo, buffers, [currX, 0, currZ]);
  }
  );

  document.addEventListener('input', () => redrawScene(gl, progInfo, buffers, [currX, 0, currZ]));
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
  
  const texcoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
  setTexcoords(gl);
  
  var texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
    new Uint8Array([0, 0, 255, 255]));
  var image = new Image();
  image.src = "../textures/00.jpg"
  image.addEventListener('load', function() {
    // Now that the image has loaded make copy it to the texture.
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
  });

  return { position: positionBuffer, texture: texture, texcoord: texcoordBuffer };
}

function renderScene(gl, programInfo, buffers, rotations, cam, radX = null, radY = null) {
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

  modelViewMatrix = matrix.translate(modelViewMatrix, cam[0], cam[1], -6.0 + cam[2]);
  modelViewMatrix = matrix.rotate(modelViewMatrix, rotations, [radX, radY]);
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
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.texcoord);
    gl.vertexAttribPointer(
      programInfo.attribLocations.texcoord,
      2,
      gl.FLOAT,
      false,
      stride,
      offset);
    gl.enableVertexAttribArray(programInfo.attribLocations.texcoord);
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



function redrawScene(gl, progInfo, buffers, cam) {
  var x = document.querySelector('.slider__x').value;
  var y = document.querySelector('.slider__y').value;
  var z = document.querySelector('.slider__z').value;

  /*var texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
    new Uint8Array([0, 0, 255, 255]));
  var image = new Image();
  image.src = "../textures/00.jpg"
  image.addEventListener('load', function() {
    // Now that the image has loaded make copy it to the texture.
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
  });

  buffers.texture = texture;*/

  renderScene(gl, progInfo, buffers, [x, y, z], cam);
}

function setTexcoords(gl) {
  gl.bufferData(
      gl.ARRAY_BUFFER,
    new Float32Array([
      -1.0, 0.0,
      0.0, Math.sqrt(5),
      1.0, 0.0,

      -1.0, 0.0,
      0.0, Math.sqrt(5),
      1.0, 0.0,

      -1.0, 0.0,
      0.0, Math.sqrt(5),
      1.0, 0.0,

      -1.0, 0.0,
      0.0, Math.sqrt(5),
      1.0, 0.0,

      -1.0, -1.0,
      -1.0, 1.0,
      1.0, -1.0,

      -1.0, 1.0,
      1.0, 1.0,
      1.0, -1.0]),
    gl.STATIC_DRAW);
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

document.addEventListener('DOMContentLoaded', main);
