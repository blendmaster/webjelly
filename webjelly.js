/* This file (webjelly.js) is compiled from webjelly.co. Please view the
original commented source there. */
(function(){
  "use strict";
  var canvas, width, height, k, ref$, v, x$, rotation, currentRot, fov, distance, mode, model, buffers, textures, thetas, phis, i$, len$, prog, calculateNormalsAndFlats, setupBuffers, draw, initialMode, pointUnder, out$ = typeof exports != 'undefined' && exports || this;
  canvas = document.getElementById('canvas');
  width = canvas.width, height = canvas.height;
  try {
    window.gl = WebGLDebugUtils.makeDebugContext(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
  } catch (e$) {}
  if (typeof gl == 'undefined' || gl === null) {
    alert("Sorry, it looks like your browser doesn't support WebGL, or webGL is disabled!");
    throw new Error("no webgl ;_;");
  }
  for (k in ref$ = gl) {
    v = ref$[k];
    if (/^[A-Z_]+$/.test(k)) {
      window[k] = v;
    }
  }
  x$ = gl;
  x$.viewport(0, 0, width, height);
  x$.enable(DEPTH_TEST);
  x$.enable(CULL_FACE);
  x$.clearColor(0, 0, 0, 1);
  x$.clear(COLOR_BUFFER_BIT | DEPTH_BUFFER_BIT);
  x$ = $('front');
  if (x$.checked) {
    gl.cullFace(FRONT);
  }
  x$.addEventListener('click', function(){
    gl.cullFace(FRONT);
    draw();
  });
  x$ = $('back');
  if (x$.checked) {
    gl.cullFace(BACK);
  }
  x$.addEventListener('click', function(){
    gl.cullFace(BACK);
    draw();
  });
  function resetStage(){
    rotation = mat4.identity();
    currentRot = mat4.identity();
    fov = 15;
    distance = 1 / Math.tan(radians(fov) / 2);
  }
  resetStage();
  $('zoom-in').addEventListener('click', function(){
    --fov;
    draw();
  });
  $('zoom-out').addEventListener('click', function(){
    ++fov;
    draw();
  });
  model = {
    loaded: false
  };
  buffers = {};
  textures = {};
  ref$ = makeDonut(), thetas = ref$.thetas, phis = ref$.phis;
  for (i$ = 0, len$ = (ref$ = ['flat', 'gouraud', 'environment', 'threedee', 'donut']).length; i$ < len$; ++i$) {
    prog = ref$[i$];
    (fn$.call(this, $(prog), prog));
  }
  calculateNormalsAndFlats = function(){
    var slice, triangles, vertices, vertNorms, coords, flat, j, i, to$, a, b, c, v0, v1, v2, cross, gouraud, ref$, minz, miny, minx, maxz, maxy, maxx, x$, toCenter, _, toStage, staging;
    slice = Array.prototype.slice;
    triangles = model.triangles, vertices = model.vertices;
    vertNorms = new Float32Array(vertices.length);
    model.coords = coords = new Float32Array(triangles.length * 3);
    model.flat = flat = new Float32Array(triangles.length * 3);
    j = 0;
    for (i = 0, to$ = triangles.length; i < to$; i += 3) {
      a = triangles[i] * 3;
      b = triangles[i + 1] * 3;
      c = triangles[i + 2] * 3;
      v0 = slice.call(vertices, a, 3 + a);
      v1 = slice.call(vertices, b, 3 + b);
      v2 = slice.call(vertices, c, 3 + c);
      cross = vec3.cross(vec3.direction(v0, v1, []), vec3.direction(v0, v2, []), []);
      vertNorms[a] += cross[0], vertNorms[a + 1] += cross[1], vertNorms[a + 2] += cross[2];
      vertNorms[b] += cross[0], vertNorms[b + 1] += cross[1], vertNorms[b + 2] += cross[2];
      vertNorms[c] += cross[0], vertNorms[c + 1] += cross[1], vertNorms[c + 2] += cross[2];
      coords[j] = v0[0], coords[j + 1] = v0[1], coords[j + 2] = v0[2];
      coords[j + 3] = v1[0], coords[j + 4] = v1[1], coords[j + 5] = v1[2];
      coords[j + 6] = v2[0], coords[j + 7] = v2[1], coords[j + 8] = v2[2];
      flat[j] = cross[0], flat[j + 1] = cross[1], flat[j + 2] = cross[2];
      flat[j + 3] = cross[0], flat[j + 4] = cross[1], flat[j + 5] = cross[2];
      flat[j + 6] = cross[0], flat[j + 7] = cross[1], flat[j + 8] = cross[2];
      j += 9;
    }
    j = 0;
    model.gouraud = gouraud = new Float32Array(triangles.length * 3);
    for (i = 0, to$ = triangles.length; i < to$; i += 3) {
      a = triangles[i] * 3;
      b = triangles[i + 1] * 3;
      c = triangles[i + 2] * 3;
      ref$ = slice.call(vertNorms, a, 3 + a), gouraud[j] -= ref$[0], gouraud[j + 1] -= ref$[1], gouraud[j + 2] -= ref$[2];
      ref$ = slice.call(vertNorms, b, 3 + b), gouraud[j + 3] -= ref$[0], gouraud[j + 4] -= ref$[1], gouraud[j + 5] -= ref$[2];
      ref$ = slice.call(vertNorms, c, 3 + c), gouraud[j + 6] -= ref$[0], gouraud[j + 7] -= ref$[1], gouraud[j + 8] -= ref$[2];
      j += 9;
    }
    minx = miny = minz = Infinity;
    maxx = maxy = maxz = 0;
    for (i = 0, to$ = vertices.length; i < to$; i += 3) {
      x$ = vertices[i];
      minx <= x$ || (minx = x$);
      maxx >= x$ || (maxx = x$);
      x$ = vertices[i + 1];
      miny <= x$ || (miny = x$);
      maxy >= x$ || (maxy = x$);
      x$ = vertices[i + 2];
      minz <= x$ || (minz = x$);
      maxz >= x$ || (maxz = x$);
    }
    toCenter = [-((minx + maxx) / 2), -((miny + maxy) / 2), -((minz + maxz) / 2)];
    toStage = (_ = Math.max(maxx - minx, maxz - miny, maxz - minz), _ = 2 / _, [_, _, _]);
    staging = mat4.identity();
    mat4.scale(staging, toStage);
    mat4.translate(staging, toCenter);
    model.staging = staging;
  };
  function isReady(){
    return (mode === 'donut' && textures.donut != null) || (model.loaded && ((mode === 'environment' && textures.environment != null) || (mode === 'threedee' && textures.threedee != null) || mode === 'flat' || mode === 'gouraud'));
  }
  setupBuffers = function(){
    if (!isReady()) {
      return;
    }
    if (mode === 'donut') {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, textures.donut);
      uniform(gl, 'texture', '1i', 0);
      buffers.theta = bindBuffer(gl, 'theta', thetas, 1);
      buffers.phi = bindBuffer(gl, 'phi', phis, 1);
    } else {
      buffers.vertices = bindBuffer(gl, 'coord', model.coords, 3);
      buffers.normals = bindBuffer(gl, 'normal', model[mode === 'flat' ? 'flat' : 'gouraud'], 3);
      if (mode === 'environment') {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, textures.environment);
        uniform(gl, 'texture', '1i', 0);
      }
    }
  };
  out$.draw = draw = function(){
    var rot, modelView;
    if (!isReady()) {
      return;
    }
    gl.clear(COLOR_BUFFER_BIT | DEPTH_BUFFER_BIT);
    if (currentRot == null) {
      currentRot = mat4.identity();
    }
    rot = mat4.multiply(currentRot, rotation, mat4.create());
    uniform(gl, 'NormalMatrix', 'Matrix3fv', mat4.toMat3(rot));
    uniform(gl, 'ProjectionMatrix', 'Matrix4fv', mat4.perspective(fov, width / height, distance - 1, distance + 3));
    modelView = mat4.identity();
    mat4.translate(modelView, [0, 0, -(distance + 1)]);
    mat4.multiply(modelView, rot);
    if (mode !== 'donut') {
      mat4.multiply(modelView, model.staging);
    }
    uniform(gl, 'ModelViewMatrix', 'Matrix4fv', modelView);
    if (mode === 'donut') {
      gl.bindBuffer(ARRAY_BUFFER, buffers.theta);
      gl.drawArrays(TRIANGLES, 0, thetas.length);
    } else {
      gl.bindBuffer(ARRAY_BUFFER, buffers.vertices);
      gl.drawArrays(TRIANGLES, 0, model.triangles.length);
    }
  };
  initialMode = mode;
  reading('donut-texture', 'AsBinaryString', function(it){
    textures.donut = readPpm(gl, it);
    resetStage();
    $('donut').disabled = false;
    if (initialMode === 'donut') {
      $('donut').click();
    }
  });
  reading('env-texture', 'AsBinaryString', function(it){
    textures.environment = readPpm(gl, it);
    resetStage();
    $('environment').disabled = false;
    if (initialMode === 'environment') {
      $('environment').click();
    }
  });
  reading('file', 'AsText', function(it){
    var tokens, ref$, numTriangles, numVertices;
    tokens = it.split(/\s+/).map(parseFloat);
    ref$ = tokens.splice(0, 2), numTriangles = ref$[0], numVertices = ref$[1];
    model.triangles = new Uint16Array(tokens.splice(0, numTriangles * 3));
    model.vertices = new Float32Array(tokens.splice(0, numVertices * 3));
    model.loaded = true;
    resetStage();
    calculateNormalsAndFlats();
    $('flat').disabled = false;
    $('gouraud').disabled = false;
    if (initialMode !== 'donut') {
      $(mode).click();
    }
  });
  pointUnder = function(x, y){
    var ref$, left, top, det;
    ref$ = canvas.getBoundingClientRect(), left = ref$.left, top = ref$.top;
    x = (x - left) * 2 / (width - 1) - 1;
    y = -((y - top) * 2 / (height - 1) - 1);
    det = 1 - x * x - y * y;
    if (det >= 0) {
      return [x, y, Math.sqrt(det)];
    } else {
      return [x / Math.sqrt(x * x + y * y), y / Math.sqrt(x * x + y * y), 0];
    }
  };
  x$ = canvas;
  x$.addEventListener('mousedown', function(arg$){
    var i0, j0, p, rotate, stop;
    i0 = arg$.clientX, j0 = arg$.clientY;
    if (!isReady()) {
      return;
    }
    x$.style.cursor = 'move';
    p = pointUnder(i0, j0);
    rotate = function(arg$){
      var i, j, q, cp, cq, angle, axis;
      i = arg$.clientX, j = arg$.clientY;
      q = pointUnder(i, j);
      cp = vec3.direction([0, 0, 0], p);
      cq = vec3.direction([0, 0, 0], q);
      angle = Math.acos(vec3.dot(cp, cq) / (vec3.length(cp) * vec3.length(cq)));
      axis = vec3.cross(cp, cq);
      currentRot = mat4.rotate(mat4.identity(), angle, axis);
      draw();
    };
    x$.addEventListener('mousemove', rotate);
    stop = (function(ran){
      return function(){
        if (!ran) {
          ran = true;
          mat4.multiply(currentRot, rotation, rotation);
          currentRot = mat4.identity();
        }
        x$.style.cursor = 'pointer';
        x$.removeEventListener('mousemove', rotate);
        x$.removeEventListener('mouseup', stop);
        x$.removeEventListener('mouseleave', stop);
      };
    }.call(this, false));
    x$.addEventListener('mouseup', stop);
    x$.addEventListener('mouseleave', stop);
  });
  function fn$(el, prog){
    if (el.checked) {
      mode = prog;
      load(prog, gl);
    }
    el.addEventListener('click', function(){
      if (this.disabled) {
        return;
      }
      mode = prog;
      load(prog, gl);
      setupBuffers();
      draw();
    });
  }
}).call(this);
