/* This file (webjelly.js) is compiled from webjelly.co. Please view the
original commented source there. */
(function(){
  var canvas, gl, k, v, x$, fragmentShader, vertexShader, program, vertexPositionAttribute, squareVerticiesBuffer, vertices, perspectiveMatrix, mvMatrix, pUniform, mvUniform;
  canvas = document.getElementById('canvas');
  try {
    gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  } catch (e$) {}
  if (gl == null) {
    alert("Sorry, it looks like your browser doesn't support WebGL, or webGL isdisabled!");
    throw new Error("no webgl ;_;");
  }
  for (k in gl) {
    v = gl[k];
    if (/^[A-Z_]+$/.test(k)) {
      window[k] = v;
    }
  }
  x$ = gl;
  x$.clearColor(0, 0, 0, 1);
  x$.enable(DEPTH_TEST);
  x$.depthFunc(LEQUAL);
  x$.clear(COLOR_BUFFER_BIT | DEPTH_BUFFER_BIT);
  x$ = fragmentShader = gl.createShader(FRAGMENT_SHADER);
  gl.shaderSource(x$, "\nvoid main(void) {\n  gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);\n}\n");
  gl.compileShader(x$);
  if (!gl.getShaderParameter(x$, COMPILE_STATUS)) {
    throw new Error("couldn't compile fragment shader!");
  }
  x$ = vertexShader = gl.createShader(VERTEX_SHADER);
  gl.shaderSource(x$, "\nattribute vec3 aVertexPosition;\n\nuniform mat4 uMVMatrix;\nuniform mat4 uPMatrix;\n\nvoid main(void) {\n  gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);\n}");
  gl.compileShader(x$);
  if (!gl.getShaderParameter(x$, COMPILE_STATUS)) {
    throw new Error("couldn't compile vertex shader!");
  }
  x$ = program = gl.createProgram();
  gl.attachShader(x$, vertexShader);
  gl.attachShader(x$, fragmentShader);
  gl.linkProgram(x$);
  if (!gl.getProgramParameter(x$, LINK_STATUS)) {
    throw new Error("couldn't intialize shader program!");
  }
  gl.useProgram(x$);
  x$ = vertexPositionAttribute = gl.getAttribLocation(program, 'aVertexPosition');
  gl.enableVertexAttribArray(x$);
  x$ = squareVerticiesBuffer = gl.createBuffer();
  gl.bindBuffer(ARRAY_BUFFER, x$);
  vertices = floats(1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1, 0);
  gl.bufferData(ARRAY_BUFFER, vertices, STATIC_DRAW);
  perspectiveMatrix = makePerspective(45, 640 / 480, 0.1, 100);
  mvMatrix = Matrix.I(4);
  mvMatrix = mvMatrix.x(Matrix.Translation($V([0, 0, -6])).ensure4x4());
  gl.vertexAttribPointer(vertexPositionAttribute, 3, FLOAT, false, 0, 0);
  pUniform = gl.getUniformLocation(program, 'uPMatrix');
  gl.uniformMatrix4fv(pUniform, false, perspectiveMatrix.floats);
  mvUniform = gl.getUniformLocation(program, 'uMVMatrix');
  gl.uniformMatrix4fv(mvUniform, false, mvMatrix.floats);
  gl.drawArrays(TRIANGLE_STRIP, 0, 4);
}).call(this);
