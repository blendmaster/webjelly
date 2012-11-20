/* This file (webjelly.js) is compiled from webjelly.co. Please view the
original commented source there. */
(function(){
  "use strict";
  var canvas, width, height, k, ref$, v, shading, x$, fov, flatLightDirection, flatProgram, gouraudProgram, donutTexture, donutProgram, triangles, vertices, verticesBuffer, normalsBuffer, trianglesBuffer, staging, distance, rotation, currentRot, gouraud, coords, flat, calculateNormalsAndFlats, currentProgram, thetas, phis, thetaBuffer, phiBuffer, setupBuffers, resetStage, draw, pointUnder, out$ = typeof exports != 'undefined' && exports || this;
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
  x$ = $('flat');
  if (x$.checked) {
    shading = 'flat';
  }
  x$.addEventListener('click', function(){
    shading = 'flat';
    flatProgram();
    setupBuffers();
    draw();
  });
  x$ = $('gouraud');
  if (x$.checked) {
    shading = 'gouraud';
  }
  x$.addEventListener('click', function(){
    shading = 'gouraud';
    gouraudProgram();
    setupBuffers();
    draw();
  });
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
  $('zoom-in').addEventListener('click', function(){
    --fov;
    draw();
  });
  $('zoom-out').addEventListener('click', function(){
    ++fov;
    draw();
  });
  x$ = gl;
  x$.viewport(0, 0, width, height);
  x$.enable(DEPTH_TEST);
  x$.enable(CULL_FACE);
  x$.clearColor(0, 0, 0, 1);
  x$.clear(COLOR_BUFFER_BIT | DEPTH_BUFFER_BIT);
  flatLightDirection = vec3.normalize(vec3.direction([-1, -1, 0], [0, 0, 5]));
  flatProgram = shaderProgram(gl, {
    vertex: "attribute vec3 coord;\nattribute vec3 normal;\n\nvarying float NdotL;\n\nuniform mat4 ModelViewMatrix;\nuniform mat4 ProjectionMatrix;\nuniform mat3 NormalMatrix;\nuniform vec3 L;\n\nvoid main() {\n  vec4 WorldCoord = ModelViewMatrix * vec4(coord,1.0);   // convert to world coordinates\n  vec3 WorldNormal = NormalMatrix * normal;                // normal in world coordinates\n  vec3 N = normalize(WorldNormal);                       // N vector for illumination\n  NdotL = dot(N,L);                                      // part of diffuse term (multiplied by k_d's etc in the fragment shader)\n  gl_Position = ProjectionMatrix * WorldCoord;             // gl_Position is a predefined variable\n    // a correctly written vertex shader should write screen space coordinates to gl_Position\n    // they are used on the rasterization stage!\n}",
    fragment: "precision mediump float;\n\nvarying float NdotL;   // interpolated NdotL values (output of the vertex shader!)\n\nuniform float LightIntensity;\nuniform float AmbientIntensity;\nuniform vec3 DiffuseAndAmbientCoefficient;     // for RGB: this is why it's a 3D vector\n\nvoid main() {\n  gl_FragColor = vec4(\n    (LightIntensity * (NdotL > 0.0 ? NdotL : 0.0) + AmbientIntensity) *\n    DiffuseAndAmbientCoefficient,\n    1);\n  // note that some simplifying assumptions are made in the above formula\n  //  for example, k_a=k_d is used; also, specular term is not used; also, no attenuation here\n}",
    init: function(gl, program){
      window.program = program;
      this.uniform1f(this.getUniformLocation(program, 'LightIntensity'), 0.9);
      this.uniform1f(this.getUniformLocation(program, 'AmbientIntensity'), 0.2);
      this.uniform3f(this.getUniformLocation(program, 'DiffuseAndAmbientCoefficient'), 1, 1, 1);
      this.uniform3fv(this.getUniformLocation(program, 'L'), flatLightDirection);
    }
  });
  gouraudProgram = shaderProgram(gl, {
    vertex: "precision mediump float;\n\nattribute vec3 coord;\nattribute vec3 normal;\n\nvarying vec3 aColor;\n\nuniform mat4 ModelViewMatrix;\nuniform mat4 ProjectionMatrix;\nuniform mat3 NormalMatrix;\nuniform vec3 LightLocation;\n\nuniform float LightIntensity;\nuniform float AmbientIntensity;\nuniform vec3 DiffuseAndAmbientCoefficient;\n\nvoid main() {\n  vec4 WorldCoord = ModelViewMatrix * vec4(coord,1.0);\n  vec3 L = normalize(LightLocation - WorldCoord.xyz);\n  vec3 WorldNormal = NormalMatrix * normal;\n  vec3 N = normalize(WorldNormal);\n  float NdotL = dot(N,L);\n  aColor =\n    ((LightIntensity * (NdotL > 0.0 ? NdotL : 0.0) + AmbientIntensity) *\n    DiffuseAndAmbientCoefficient);\n\n  gl_Position = ProjectionMatrix * WorldCoord;\n}",
    fragment: "precision mediump float;\n\nvarying vec3 aColor;\n\nvoid main() {\n  gl_FragColor = vec4(aColor, 1.0);\n  //  (LightIntensity * (NdotL > 0.0 ? NdotL : 0.0) + AmbientIntensity) *\n   // DiffuseAndAmbientCoefficient,\n   // 1);\n}",
    init: function(gl, program){
      window.program = program;
      gl.uniform1f(gl.getUniformLocation(program, 'LightIntensity'), 0.9);
      gl.uniform1f(gl.getUniformLocation(program, 'AmbientIntensity'), 0.2);
      gl.uniform3f(gl.getUniformLocation(program, 'DiffuseAndAmbientCoefficient'), 1, 1, 1);
      gl.uniform3fv(gl.getUniformLocation(program, 'LightLocation'), [-1, -1, -10]);
    }
  });
  read('donut-texture', 'AsBinaryString', function(it){
    donutTexture = readPpm(gl, it);
    setupBuffers();
    resetStage();
    draw();
  });
  donutProgram = shaderProgram(gl, {
    vertex: "#define TWOPI " + 2 * Math.PI + "\nprecision mediump float;\n\nattribute float theta;\nattribute float phi;\n\nvarying vec2 tex;\nvarying float intensity;\n\nuniform mat4 ModelViewMatrix;\nuniform mat4 ProjectionMatrix;\nuniform mat3 NormalMatrix;\nuniform vec3 LightLocation;\n\nuniform float LightIntensity;\nuniform float AmbientIntensity;\nuniform vec3 DiffuseAndAmbientCoefficient;\n\nvoid main() {\n  vec3 coord = vec3( (0.75 + 0.25 * cos(phi)) * cos(theta)\n                   , (0.75 + 0.25 * cos(phi)) * sin(theta)\n                   , 0.25 * sin(phi)\n                   );\n  vec3 normal = vec3( -cos(phi) * cos(theta)\n                    , -cos(phi) * sin(theta)\n                    , -sin(phi)\n                    );\n  tex = vec2(theta/TWOPI,phi/TWOPI);\n\n  vec4 WorldCoord = ModelViewMatrix * vec4(coord,1.0);\n  vec3 L = normalize(LightLocation - WorldCoord.xyz);\n  vec3 WorldNormal = NormalMatrix * normal;\n  vec3 N = normalize(WorldNormal);\n  float NdotL = dot(N,L);\n  intensity =\n    (LightIntensity * (NdotL > 0.0 ? NdotL : 0.0) + AmbientIntensity);\n\n  gl_Position = ProjectionMatrix * WorldCoord;\n}",
    fragment: "precision mediump float;\n\nuniform sampler2D texture;\n\nvarying vec2 tex; // coords\nvarying float intensity;\n\nvoid main() {\n  gl_FragColor = vec4(intensity * texture2D(texture, tex).xyz, 1.0);\n}",
    init: function(gl, program){
      window.program = program;
      gl.uniform1f(gl.getUniformLocation(program, 'LightIntensity'), 0.5);
      gl.uniform1f(gl.getUniformLocation(program, 'AmbientIntensity'), 0.5);
      gl.uniform3fv(gl.getUniformLocation(program, 'LightLocation'), [-1, -1, -10]);
    }
  });
  staging = mat4.identity();
  calculateNormalsAndFlats = function(){
    var slice, vertNorms, j, i, to$, a, b, c, v0, v1, v2, cross, ref$, minz, miny, minx, maxz, maxy, maxx, x$, toCenter, _, toStage;
    slice = Array.prototype.slice;
    vertNorms = new Float32Array(vertices.length);
    coords = new Float32Array(triangles.length * 3);
    flat = new Float32Array(triangles.length * 3);
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
    gouraud = new Float32Array(triangles.length * 3);
    for (i = 0, to$ = triangles.length; i < to$; i += 3) {
      a = triangles[i] * 3;
      b = triangles[i + 1] * 3;
      c = triangles[i + 2] * 3;
      ref$ = slice.call(vertNorms, a, 3 + a), gouraud[j] = ref$[0], gouraud[j + 1] = ref$[1], gouraud[j + 2] = ref$[2];
      ref$ = slice.call(vertNorms, b, 3 + b), gouraud[j + 3] = ref$[0], gouraud[j + 4] = ref$[1], gouraud[j + 5] = ref$[2];
      ref$ = slice.call(vertNorms, c, 3 + c), gouraud[j + 6] = ref$[0], gouraud[j + 7] = ref$[1], gouraud[j + 8] = ref$[2];
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
  };
  currentProgram = 'donut';
  ref$ = makeDonut(), thetas = ref$[0], phis = ref$[1];
  setupBuffers = function(){
    var x$, y$;
    if (currentProgram === 'donut') {
      donutProgram();
      if (donutTexture != null) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, donutTexture);
        gl.uniform1i(gl.getUniformLocation(program, 'texture'), 0);
      }
      x$ = thetaBuffer = gl.createBuffer();
      gl.bindBuffer(ARRAY_BUFFER, x$);
      gl.bufferData(ARRAY_BUFFER, thetas, STATIC_DRAW);
      y$ = gl.getAttribLocation(program, 'theta');
      gl.enableVertexAttribArray(y$);
      gl.vertexAttribPointer(y$, 1, FLOAT, false, 0, 0);
      x$ = phiBuffer = gl.createBuffer();
      gl.bindBuffer(ARRAY_BUFFER, x$);
      gl.bufferData(ARRAY_BUFFER, phis, STATIC_DRAW);
      y$ = gl.getAttribLocation(program, 'phi');
      gl.enableVertexAttribArray(y$);
      gl.vertexAttribPointer(y$, 1, FLOAT, false, 0, 0);
    } else {
      x$ = verticesBuffer = gl.createBuffer();
      gl.bindBuffer(ARRAY_BUFFER, x$);
      gl.bufferData(ARRAY_BUFFER, coords, STATIC_DRAW);
      y$ = gl.getAttribLocation(program, 'coord');
      gl.enableVertexAttribArray(y$);
      gl.vertexAttribPointer(y$, 3, FLOAT, false, 0, 0);
      x$ = normalsBuffer = gl.createBuffer();
      gl.bindBuffer(ARRAY_BUFFER, x$);
      gl.bufferData(ARRAY_BUFFER, shading === 'flat' ? flat : gouraud, STATIC_DRAW);
      y$ = gl.getAttribLocation(program, 'normal');
      gl.enableVertexAttribArray(y$);
      gl.vertexAttribPointer(y$, 3, FLOAT, false, 0, 0);
    }
  };
  resetStage = function(){
    rotation = mat4.identity();
    currentRot = mat4.identity();
    fov = 15;
    distance = 1 / Math.tan(radians(fov) / 2);
  };
  out$.draw = draw = function(){
    var rot, modelView;
    gl.clear(COLOR_BUFFER_BIT | DEPTH_BUFFER_BIT);
    rot = mat4.multiply(currentRot, rotation, mat4.create());
    gl.uniformMatrix4fv(gl.getUniformLocation(program, 'ProjectionMatrix'), false, mat4.perspective(fov, width / height, distance - 1, distance + 3));
    gl.uniformMatrix3fv(gl.getUniformLocation(program, 'NormalMatrix'), false, mat4.toMat3(rot));
    modelView = mat4.identity();
    mat4.translate(modelView, [0, 0, -(distance + 1)]);
    mat4.multiply(modelView, rot);
    mat4.multiply(modelView, staging);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, 'ModelViewMatrix'), false, modelView);
    if (currentProgram === 'donut') {
      gl.bindBuffer(ARRAY_BUFFER, thetaBuffer);
      gl.drawArrays(TRIANGLES, 0, thetas.length);
    } else {
      gl.bindBuffer(ARRAY_BUFFER, verticesBuffer);
      gl.drawArrays(TRIANGLES, 0, triangles.length);
    }
  };
  read('file', 'AsText', function(it){
    var tokens, ref$, numTriangles, numVertices;
    tokens = it.split(/\s+/).map(parseFloat);
    ref$ = tokens.splice(0, 2), numTriangles = ref$[0], numVertices = ref$[1];
    triangles = new Uint16Array(tokens.splice(0, numTriangles * 3));
    vertices = new Float32Array(tokens.splice(0, numVertices * 3));
    if (shading === 'flat') {
      flatProgram();
    } else {
      gouraudProgram();
    }
    calculateNormalsAndFlats();
    setupBuffers();
    resetStage();
    draw();
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
    if (currentRot == null) {
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
}).call(this);
