export let copyVideo = false;

export function setUp(url) {
  const video = document.createElement('video');
  var playing = false;
  var timeupdate = false;
  video.autoplay = true;
  video.muted = true;
  video.loop = true;
  video.addEventListener('playing', function() {
     playing = true;
     checkReady();
  }, true);
  video.addEventListener('timeupdate', function() {
     timeupdate = true;
     checkReady();
  }, true);
  video.src = url;
  video.play();

  function checkReady() {
    if (playing && timeupdate)
      copyVideo = true;
  }
  return video;
}

export function initVideoTexture(gl) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  const pixel = new Uint8Array([0, 0, 255, 255]);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  return texture;
}

export function updateTexture(gl, texture, video) {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
                gl.RGBA, gl.UNSIGNED_BYTE, video);
}
