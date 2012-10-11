/* This file (webjelly.js) is compiled from webjelly.co. Please view the
original commented source there. */
(function(){
  "use strict";
  var canvas, width, height, k, ref$, v, x$, fov, calculateNormals, triangles, vertices, verticesBuffer, normalsBuffer, trianglesBuffer, staging, distance, rotation, currentRot, setupBuffers, draw, parse, pointUnder, out$ = typeof exports != 'undefined' && exports || this;
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
  x$.disable(DEPTH_TEST);
  x$.enable(CULL_FACE);
  x$.clearColor(0, 0, 0, 1);
  x$.clear(COLOR_BUFFER_BIT | DEPTH_BUFFER_BIT);
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
    this.uniform3f(this.getUniformLocation(program, 'DiffuseAndAmbientCoefficient'), 1.0, 1.0, 1.0);
    this.uniform3f(this.getUniformLocation(program, 'LightLocation'), -200, 200, 200);
  }.call(gl));
  calculateNormals = function(){
    var gouraud, i, to$, a, b, c, v0, v1, v2, cross;
    gouraud = new Float32Array(vertices.length);
    for (i = 0, to$ = triangles.length - 3; i <= to$; i += 3) {
      a = triangles[i] * 3;
      b = triangles[i + 1] * 3;
      c = triangles[i + 2] * 3;
      v0 = Array.prototype.slice.call(vertices, a, 3 + a);
      v1 = Array.prototype.slice.call(vertices, b, 3 + b);
      v2 = Array.prototype.slice.call(vertices, c, 3 + c);
      cross = vec3.cross(vec3.direction(v0, v1, []), vec3.direction(v0, v2, []), []);
      gouraud[a] += cross[0];
      gouraud[a + 1] += cross[1];
      gouraud[a + 2] += cross[2];
      gouraud[b] += cross[0];
      gouraud[b + 1] += cross[1];
      gouraud[b + 2] += cross[2];
      gouraud[c] += cross[0];
      gouraud[c + 1] += cross[1];
      gouraud[c + 2] += cross[2];
    }
    return gouraud;
  };
  setupBuffers = function(){
    var gouraud, minz, miny, minx, maxz, maxy, maxx, i, to$, x$, _, toCenter, toStage, y$;
    gouraud = calculateNormals();
    log("normals: " + gouraud);
    minx = miny = minz = Infinity;
    maxx = maxy = maxz = 0;
    for (i = 0, to$ = vertices.length - 3; i <= to$; i += 3) {
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
    log("min: " + minx + " " + miny + " " + minz);
    log("max: " + maxx + " " + maxy + " " + maxz);
    toCenter = (_ = [-((minx + maxx) / 2), -((miny + maxy) / 2), -((minz + maxz) / 2)], mat4.translate(mat4.identity(), _));
    toStage = (_ = Math.max(maxx - minx, maxz - miny, maxz - minz), _ = 2 / _, _ = log([_, _, _]), mat4.scale(mat4.identity(), _));
    staging = mat4.multiply(toCenter, toStage, mat4.create());
    x$ = verticesBuffer = gl.createBuffer();
    gl.bindBuffer(ARRAY_BUFFER, x$);
    gl.bufferData(ARRAY_BUFFER, vertices, STATIC_DRAW);
    y$ = gl.getAttribLocation(program, 'coord');
    gl.enableVertexAttribArray(y$);
    gl.vertexAttribPointer(y$, 3, FLOAT, false, 0, 0);
    x$ = normalsBuffer = gl.createBuffer();
    gl.bindBuffer(ELEMENT_ARRAY_BUFFER, x$);
    gl.bufferData(ELEMENT_ARRAY_BUFFER, gouraud, STATIC_DRAW);
    y$ = gl.getAttribLocation(program, 'normal');
    gl.enableVertexAttribArray(y$);
    gl.vertexAttribPointer(y$, 3, FLOAT, false, 0, 0);
    console.log(triangles);
    x$ = trianglesBuffer = gl.createBuffer();
    gl.bindBuffer(ELEMENT_ARRAY_BUFFER, x$);
    gl.bufferData(ELEMENT_ARRAY_BUFFER, triangles, STATIC_DRAW);
    rotation = mat4.identity();
    currentRot = mat4.identity();
    fov = 15;
    distance = 1 / Math.tan(radians(fov) / 2);
  };
  out$.draw = draw = function(){
    var rot, modelView;
    gl.clear(COLOR_BUFFER_BIT | DEPTH_BUFFER_BIT);
    rot = mat4.multiply(rotation, currentRot, mat4.create());
    gl.uniformMatrix4fv(gl.getUniformLocation(program, 'ProjectionMatrix'), false, mat4.perspective(fov, 1, distance - 1, distance + 3));
    gl.uniformMatrix3fv(gl.getUniformLocation(program, 'NormalMatrix'), false, mat4.toMat3(rot));
    modelView = mat4.identity();
    mat4.multiply(modelView, staging);
    mat4.multiply(modelView, rot);
    mat4.multiply(modelView, mat4.translate(mat4.identity(), [0, 0, -(distance + 1)]));
    gl.uniformMatrix4fv(gl.getUniformLocation(program, 'ModelViewMatrix'), false, modelView);
    gl.bindBuffer(ELEMENT_ARRAY_BUFFER, trianglesBuffer);
    gl.drawElements(TRIANGLES, triangles.length, UNSIGNED_SHORT, 0);
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
        setupBuffers();
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
          mat4.multiply(rotation, currentRot);
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
