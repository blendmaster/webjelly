/* This file (webjelly.js) is compiled from webjelly.co. Please view the
original commented source there. */
(function(){
  "use strict";
  var canvas, width, height, k, ref$, v, x$, fragmentShader, vertexShader, program, draw, parse;
  canvas = document.getElementById('canvas');
  width = canvas.width, height = canvas.height;
  try {
    window.gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  } catch (e$) {}
  if (typeof gl == 'undefined' || gl === null) {
    alert("Sorry, it looks like your browser doesn't support WebGL, or webGL isdisabled!");
    throw new Error("no webgl ;_;");
  }
  for (k in ref$ = gl) {
    v = ref$[k];
    window[k] = typeof v === 'function' ? v.bind(gl) : v;
  }
  viewport(0, 0, width, height);
  clearColor(0, 0, 0, 1);
  enable(DEPTH_TEST);
  depthFunc(LEQUAL);
  clear(COLOR_BUFFER_BIT | DEPTH_BUFFER_BIT);
  x$ = fragmentShader = createShader(FRAGMENT_SHADER);
  shaderSource(x$, "\nvoid main(void) {\n  gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);\n}\n");
  compileShader(x$);
  if (!getShaderParameter(x$, COMPILE_STATUS)) {
    throw new Error("couldn't compile fragment shader!");
  }
  x$ = vertexShader = createShader(VERTEX_SHADER);
  shaderSource(x$, "\nattribute vec3 position;\n\nuniform mat4 modelView;\nuniform mat4 projection;\n\nvoid main(void) {\n  gl_Position = projection * modelView * vec4(position, 1.0);\n}");
  compileShader(x$);
  if (!getShaderParameter(x$, COMPILE_STATUS)) {
    throw new Error("couldn't compile vertex shader!");
  }
  x$ = program = createProgram();
  attachShader(x$, vertexShader);
  attachShader(x$, fragmentShader);
  linkProgram(x$);
  if (!getProgramParameter(x$, LINK_STATUS)) {
    throw new Error("couldn't intialize shader program!");
  }
  useProgram(x$);
  draw = function(triangles, vertices){
    var x$, verticesBuffer;
    x$ = verticesBuffer = createBuffer();
    bindBuffer(ARRAY_BUFFER, x$);
    bufferData(ARRAY_BUFFER, vertices, STATIC_DRAW);
    x$ = getAttribLocation(program, 'position');
    enableVertexAttribArray(x$);
    vertexAttribPointer(x$, 3, FLOAT, false, 0, 0);
    uniformMatrix4fv(getUniformLocation(program, 'perspective'), false, mat4.perspective(45, width / height, 0.1, 100));
    uniformMatrix4fv(getUniformLocation(program, 'modelView'), false, mat4.translation(0, 0, -6));
    drawArrays(TRIANGLES, 0, vertices.length);
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
        draw(tokens.splice(0, numTriangles * 3), new Float32Array(tokens.splice(0, numVertices * 3)));
      };
    }
  };
  x$ = document.getElementById('file');
  x$.addEventListener('change', parse);
  parse.call(x$);
}).call(this);
