/* This file (webjelly.js) is compiled from webjelly.co. Please view the
original commented source there. */
(function(){
  "use strict";
  var canvas, width, height, k, ref$, v, shading, x$, fov, flatLightDirection, flatProgram, gouraudProgram, triangles, vertices, verticesBuffer, normalsBuffer, trianglesBuffer, staging, distance, rotation, currentRot, gouraud, flatNorms, flatVerts, calculateNormalsAndFlats, setupBuffers, resetStage, draw, parse, pointUnder, out$ = typeof exports != 'undefined' && exports || this;
  canvas = document.getElementById('canvas');
  width = canvas.width, height = canvas.height;
  try {
    window.gl = WebGLDebugUtils.makeDebugContext(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
  } catch (e$) {}
  if (typeof gl == 'undefined' || gl === null) {
    alert("Sorry, it looks like your browser doesn't support WebGL, or webGL isdisabled!");
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
  flatProgram = function(){
    (function(){
      var x$, vertexShader, fragmentShader;
      x$ = vertexShader = this.createShader(VERTEX_SHADER);
      this.shaderSource(x$, "attribute vec3 coord;\nattribute vec3 normal;\n\nvarying float NdotL;\n\nuniform mat4 ModelViewMatrix;\nuniform mat4 ProjectionMatrix;\nuniform mat3 NormalMatrix;\nuniform vec3 L;\n\nvoid main() {\n  vec4 WorldCoord = ModelViewMatrix * vec4(coord,1.0);   // convert to world coordinates\n  vec3 WorldNormal = NormalMatrix * normal;                // normal in world coordinates\n  vec3 N = normalize(WorldNormal);                       // N vector for illumination\n  NdotL = dot(N,L);                                      // part of diffuse term (multiplied by k_d's etc in the fragment shader)\n  gl_Position = ProjectionMatrix * WorldCoord;             // gl_Position is a predefined variable\n    // a correctly written vertex shader should write screen space coordinates to gl_Position\n    // they are used on the rasterization stage!\n}");
      this.compileShader(x$);
      if (!this.getShaderParameter(x$, COMPILE_STATUS)) {
        throw new Error("couldn't compile vertex shader!");
      }
      x$ = fragmentShader = this.createShader(FRAGMENT_SHADER);
      this.shaderSource(x$, "precision mediump float;\n\nvarying float NdotL;   // interpolated NdotL values (output of the vertex shader!)\n\nuniform float LightIntensity;\nuniform float AmbientIntensity;\nuniform vec3 DiffuseAndAmbientCoefficient;     // for RGB: this is why it's a 3D vector\n\nvoid main() {\n  gl_FragColor = vec4(\n    (LightIntensity * (NdotL > 0.0 ? NdotL : 0.0) + AmbientIntensity) *\n    DiffuseAndAmbientCoefficient,\n    1);\n  // note that some simplifying assumptions are made in the above formula\n  //  for example, k_a=k_d is used; also, specular term is not used; also, no attenuation here\n}");
      this.compileShader(x$);
      if (!this.getShaderParameter(x$, COMPILE_STATUS)) {
        throw new Error("couldn't compile fragment shader!");
      }
      x$ = window.program = this.createProgram();
      this.attachShader(x$, vertexShader);
      this.attachShader(x$, fragmentShader);
      this.linkProgram(x$);
      if (!this.getProgramParameter(x$, LINK_STATUS)) {
        throw new Error("couldn't intialize shader program!");
      }
      this.useProgram(x$);
      this.uniform1f(this.getUniformLocation(program, 'LightIntensity'), 0.9);
      this.uniform1f(this.getUniformLocation(program, 'AmbientIntensity'), 0.2);
      this.uniform3f(this.getUniformLocation(program, 'DiffuseAndAmbientCoefficient'), 1, 1, 1);
      this.uniform3fv(this.getUniformLocation(program, 'L'), flatLightDirection);
    }.call(gl));
  };
  gouraudProgram = function(){
    (function(){
      var x$, vertexShader, fragmentShader;
      x$ = vertexShader = this.createShader(VERTEX_SHADER);
      this.shaderSource(x$, "attribute vec3 coord;\nattribute vec3 normal;\n\nvarying float NdotL;\n\nuniform mat4 ModelViewMatrix;\nuniform mat4 ProjectionMatrix;\nuniform mat3 NormalMatrix;\nuniform vec3 LightLocation;\n\nvoid main() {\n  vec4 WorldCoord = ModelViewMatrix * vec4(coord,1.0);   // convert to world coordinates\n  vec3 L = normalize(LightLocation - WorldCoord.xyz);    // L vector for illumination\n  vec3 WorldNormal = NormalMatrix * normal;                // normal in world coordinates\n  vec3 N = normalize(WorldNormal);                       // N vector for illumination\n  NdotL = dot(N,L);                                      // part of diffuse term (multiplied by k_d's etc in the fragment shader)\n  gl_Position = ProjectionMatrix * WorldCoord;             // gl_Position is a predefined variable\n    // a correctly written vertex shader should write screen space coordinates to gl_Position\n    // they are used on the rasterization stage!\n}");
      this.compileShader(x$);
      if (!this.getShaderParameter(x$, COMPILE_STATUS)) {
        throw new Error("couldn't compile vertex shader!");
      }
      x$ = fragmentShader = this.createShader(FRAGMENT_SHADER);
      this.shaderSource(x$, "precision mediump float;\n\nvarying float NdotL;   // interpolated NdotL values (output of the vertex shader!)\n// note that interpolation qualifiers have to match between vertex and fragment shader\n\nuniform float LightIntensity;\nuniform float AmbientIntensity;\nuniform vec3 DiffuseAndAmbientCoefficient;     // for RGB: this is why it's a 3D vector\n\nvoid main() {\n  gl_FragColor = vec4(\n    (LightIntensity * (NdotL > 0.0 ? NdotL : 0.0) + AmbientIntensity) *\n    DiffuseAndAmbientCoefficient,\n    1);\n  // note that some simplifying assumptions are made in the above formula\n  //  for example, k_a=k_d is used; also, specular term is not used; also, no attenuation here\n}");
      this.compileShader(x$);
      if (!this.getShaderParameter(x$, COMPILE_STATUS)) {
        throw new Error("couldn't compile fragment shader!");
      }
      x$ = window.program = this.createProgram();
      this.attachShader(x$, vertexShader);
      this.attachShader(x$, fragmentShader);
      this.linkProgram(x$);
      if (!this.getProgramParameter(x$, LINK_STATUS)) {
        throw new Error("couldn't intialize shader program!");
      }
      this.useProgram(x$);
      this.uniform1f(this.getUniformLocation(program, 'LightIntensity'), 0.9);
      this.uniform1f(this.getUniformLocation(program, 'AmbientIntensity'), 0.2);
      this.uniform3f(this.getUniformLocation(program, 'DiffuseAndAmbientCoefficient'), 1, 1, 1);
      this.uniform3fv(this.getUniformLocation(program, 'LightLocation'), [-1, -1, -10]);
    }.call(gl));
  };
  calculateNormalsAndFlats = function(){
    var j, i, to$, a, b, c, v0, v1, v2, cross, minz, miny, minx, maxz, maxy, maxx, x$, toCenter, _, toStage;
    gouraud = new Float32Array(vertices.length);
    flatNorms = new Float32Array(triangles.length * 3);
    flatVerts = new Float32Array(triangles.length * 3);
    j = 0;
    for (i = 0, to$ = triangles.length; i < to$; i += 3) {
      a = triangles[i] * 3;
      b = triangles[i + 1] * 3;
      c = triangles[i + 2] * 3;
      v0 = Array.prototype.slice.call(vertices, a, 3 + a);
      v1 = Array.prototype.slice.call(vertices, b, 3 + b);
      v2 = Array.prototype.slice.call(vertices, c, 3 + c);
      cross = vec3.cross(vec3.direction(v0, v1, []), vec3.direction(v0, v2, []), []);
      gouraud[a] += cross[0], gouraud[a + 1] += cross[1], gouraud[a + 2] += cross[2];
      gouraud[b] += cross[0], gouraud[b + 1] += cross[1], gouraud[b + 2] += cross[2];
      gouraud[c] += cross[0], gouraud[c + 2] += cross[1], gouraud[c + 2] += cross[2];
      flatVerts[j] = v0[0], flatVerts[j + 1] = v0[1], flatVerts[j + 2] = v0[2];
      flatVerts[j + 3] = v1[0], flatVerts[j + 4] = v1[1], flatVerts[j + 5] = v1[2];
      flatVerts[j + 6] = v2[0], flatVerts[j + 7] = v2[1], flatVerts[j + 8] = v2[2];
      flatNorms[j] = cross[0], flatNorms[j + 1] = cross[1], flatNorms[j + 2] = cross[2];
      flatNorms[j + 3] = cross[0], flatNorms[j + 4] = cross[1], flatNorms[j + 5] = cross[2];
      flatNorms[j + 6] = cross[0], flatNorms[j + 7] = cross[1], flatNorms[j + 8] = cross[2];
      j += 9;
    }
    console.log(flatNorms);
    console.log(flatVerts);
    console.log(j);
    console.log(triangles.length * 3);
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
  setupBuffers = function(){
    var x$, y$;
    console.log(shading);
    x$ = verticesBuffer = gl.createBuffer();
    gl.bindBuffer(ARRAY_BUFFER, x$);
    gl.bufferData(ARRAY_BUFFER, shading === 'flat' ? flatVerts : vertices, STATIC_DRAW);
    y$ = gl.getAttribLocation(program, 'coord');
    gl.enableVertexAttribArray(y$);
    gl.vertexAttribPointer(y$, 3, FLOAT, false, 0, 0);
    x$ = normalsBuffer = gl.createBuffer();
    gl.bindBuffer(ARRAY_BUFFER, x$);
    gl.bufferData(ARRAY_BUFFER, shading === 'flat' ? flatNorms : gouraud, STATIC_DRAW);
    y$ = gl.getAttribLocation(program, 'normal');
    gl.enableVertexAttribArray(y$);
    gl.vertexAttribPointer(y$, 3, FLOAT, false, 0, 0);
    x$ = trianglesBuffer = gl.createBuffer();
    gl.bindBuffer(ELEMENT_ARRAY_BUFFER, x$);
    gl.bufferData(ELEMENT_ARRAY_BUFFER, triangles, STATIC_DRAW);
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
    if (shading === 'gouraud') {
      gl.bindBuffer(ELEMENT_ARRAY_BUFFER, trianglesBuffer);
      gl.drawElements(TRIANGLES, triangles.length, UNSIGNED_SHORT, 0);
    } else {
      gl.bindBuffer(ARRAY_BUFFER, verticesBuffer);
      gl.drawArrays(TRIANGLES, 0, triangles.length);
    }
  };
  parse = function(){
    var that, x$;
    if (that = this.files[0]) {
      x$ = new FileReader;
      x$.readAsText(that);
      x$.onload = function(){
        var tokens, ref$, numTriangles, numVertices;
        tokens = this.result.split(/\s+/).map(parseFloat);
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
      };
    }
  };
  x$ = $('file');
  x$.addEventListener('change', parse);
  parse.call(x$);
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
        var ran;
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
