export function multiply(m1, m2, shape = 4) {
    var result = [];
    for (var i = 0; i < shape; i++) {
        for (var j = 0; j < shape; j++) {
            var sum = 0;
            for (var k = 0; k < shape; k++) {
                sum += m1[i * 4 + k] * m2[k * 4 + j];
            }
            result[i * 4 + j] = sum;
        }
    }
    return result;
}

export function perspective(matrix, fieldOfView, aspect, near, far) {
  var f = Math.tan(Math.PI * 0.5 - 0.5 * degToRad(fieldOfView));
  var rangeInv = 1.0 / (near - far);

  return multiply(
    matrix, 
    [
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (near + far) * rangeInv, -1,
    0, 0, near * far * rangeInv * 2, 0
    ], 4);
}

export function translate(matrix, tx, ty, tz) {
  return multiply(
    matrix,
    [
       1,  0,  0,  0,
       0,  1,  0,  0,
       0,  0,  1,  0,
       tx, ty, tz, 1,
    ], 4);
}

export function rotate(matrix, angles, rAngles = [null, null]) {
  matrix = rotateZ(rotateY(rotateX(matrix, angles[0], rAngles[0]), angles[1], rAngles[1]), angles[2]);
  return matrix;
}
/*
// I'll figure out what happens there later
export function rotate_cam(matrix, angles) {
  return multiply(matrix, multiply(xRotation(angles[0]), multiply(zRotation(angles[2]), yRotation(angles[1]))));
}

function yRotation(angle) {
  var c = Math.cos(degToRad(angle));
  var s = Math.sin(degToRad(angle));
  return [
    c, 0, -s, 0,
    0, 1, 0, 0,
    s, 0, c, 0,
    0, 0, 0, 1,
  ];
}

function xRotation(angle) {
  var c = Math.cos(degToRad(angle));
  var s = Math.sin(degToRad(angle));
  return [
    1, 0, 0, 0,
    0, c, s, 0,
    0, -s, c, 0,
    0, 0, 0, 1,
  ];
}

function zRotation(angle) {
  var c = Math.cos(degToRad(angle));
  var s = Math.sin(degToRad(angle));
  return [
    c, s, 0, 0,
    -s, c, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
  ];
}
*/
// TODO: rewrite in more friendly way
function rotateX(m, angle, rAngle = null) {
  var out = [];
  var c, s;
  if (rAngle == null) {
    c = Math.cos(degToRad(angle));
    s = Math.sin(degToRad(angle));
  } else {
    c = Math.cos(rAngle);
    s = Math.sin(rAngle);
  };
  for (var i = 0; i < 4; i++) {
    out[i] = m[i];
    out[i + 12] = m[i + 12];
  }
  for (var i = 4; i < 8; i++)
    out[i] = m[i] * c + m[i + 4] * s;
  for (var i = 8; i < 12; i++)
    out[i] = m[i] * c - m[i - 4] * s;
  return out;
}

function rotateY(m, angle, rAngle = null) {
  var out = [];
  var c, s;
  if (rAngle == null) {
    c = Math.cos(degToRad(angle));
    s = Math.sin(degToRad(angle));
  } else {
    c = Math.cos(rAngle);
    s = Math.sin(rAngle);
  };
  for (var i = 4; i < 8; i++) {
    out[i] = m[i];
    out[i + 8] = m[i + 8];
  }
  for (var i = 0; i < 4; i++)
    out[i] = m[i] * c - m[i + 8] * s;
  for (var i = 8; i < 12; i++)
    out[i] = m[i - 8] * s + m[i] * c;
  return out;
}

function rotateZ(m, angle) {
  var out = [];
  var c = Math.cos(degToRad(angle));
  var s = Math.sin(degToRad(angle));
  for (var i = 8; i < 16; i++)
    out[i] = m[i];
  for (var i = 0; i < 4; i++)
    out[i] = m[i] * c + m[i + 4] * s;
  for (var i = 4; i < 8; i++)
    out[i] = m[i] * c - m[i - 4] * s;
  return out;
}

export function radToDeg(r) {
  return r * 180 / Math.PI;
}

function degToRad(d) {
    return d * Math.PI / 180;
}

export function getNewPhase(oldPhase) {
  oldPhase += 1;
  if (oldPhase > 360)
    oldPhase = 0;
  return (oldPhase, degToRad(oldPhase));
}
