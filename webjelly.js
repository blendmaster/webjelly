/* This file (webjelly.js) is compiled from webjelly.co. Please view the
original commented source there. */
(function(){
  "use strict";
  var canvas, width, height, k, ref$, v, x$, degrees, radians, draw, log, parse;
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
  x$ = gl;
  x$.viewport(0, 0, width, height);
  x$.clearColor(0, 0, 0, 1);
  x$.disable(DEPTH_TEST);
  x$.disable(CULL_FACE);
  x$.clear(COLOR_BUFFER_BIT | DEPTH_BUFFER_BIT);
  (function(){
    var x$, vertexShader, fragmentShader;
    x$ = vertexShader = this.createShader(VERTEX_SHADER);
    this.shaderSource(x$, "attribute vec3 position;\n\nuniform mat4 modelView;\nuniform mat4 perspective;\n\nvoid main(void) {\n  gl_Position = perspective * modelView * vec4(position, 1.0);\n}");
    this.compileShader(x$);
    if (!this.getShaderParameter(x$, COMPILE_STATUS)) {
      throw new Error("couldn't compile vertex shader!");
    }
    x$ = fragmentShader = this.createShader(FRAGMENT_SHADER);
    this.shaderSource(x$, "\nvoid main(void) {\n  gl_FragColor = vec4(0.8, 1.0, 1.0, 1.0);\n}\n");
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
  }.call(gl));
  degrees = function(it){
    return it * 180 / Math.PI;
  };
  radians = function(it){
    return it * Math.PI / 180;
  };
  draw = function(triangles, vertices){
    var minz, miny, minx, maxz, maxy, maxx, i, to$, x$, toCenter, _, toStage, verticesBuffer, y$, trianglesBuffer, fov, distance, modelView;
    log(triangles);
    log(vertices);
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
    toCenter = [-((minx + maxx) / 2), -((miny + maxy) / 2), -((minz + maxz) / 2)];
    toStage = (_ = Math.max(maxx - minx, maxz - miny, maxz - minz), _ = 2 / _, [_, _, _]);
    console.log(toCenter);
    console.log(toStage);
    x$ = verticesBuffer = gl.createBuffer();
    gl.bindBuffer(ARRAY_BUFFER, x$);
    gl.bufferData(ARRAY_BUFFER, new Float32Array(vertices), STATIC_DRAW);
    y$ = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(y$);
    gl.vertexAttribPointer(y$, 3, FLOAT, false, 0, 0);
    x$ = trianglesBuffer = gl.createBuffer();
    gl.bindBuffer(ELEMENT_ARRAY_BUFFER, x$);
    gl.bufferData(ELEMENT_ARRAY_BUFFER, new Uint16Array(triangles), STATIC_DRAW);
    fov = 15;
    distance = 1 / Math.tan(radians(fov) / 2);
    console.log(distance);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, 'perspective'), false, mat4.perspective(fov, 1, log(distance - 1), log(distance + 3)));
    modelView = mat4.identity();
    log(mat4.translate(modelView, toCenter));
    mat4.rotateY(modelView, radians(-1.6));
    mat4.translate(modelView, [0, 0, -(distance + 1)]);
    mat4.scale(modelView, toStage);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, 'modelView'), false, modelView);
    gl.clear(COLOR_BUFFER_BIT | DEPTH_BUFFER_BIT);
    gl.bindBuffer(ELEMENT_ARRAY_BUFFER, trianglesBuffer);
    gl.drawElements(TRIANGLES, triangles.length, UNSIGNED_SHORT, 0);
  };
  log = function(it){
    console.log(it);
    return it;
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
        draw(new Uint16Array(tokens.splice(0, numTriangles * 3)), new Float32Array(tokens.splice(0, numVertices * 3)));
      };
    }
  };
  x$ = document.getElementById('file');
  x$.addEventListener('change', parse);
  parse.call(x$);
}).call(this);
