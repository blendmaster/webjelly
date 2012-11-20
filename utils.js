/* This file (utils.js) is compiled from utils.co. Please view the
original commented source there. */
(function(){
  "use strict";
  var log, degrees, radians, $, flatten3d, readPpm, RES, CIRCLE, RADS, makeDonut, sphereToCube, shaderProgram, out$ = typeof exports != 'undefined' && exports || this, slice$ = [].slice;
  mat4.translation = function(translation){
    return mat4.translate(mat4.identity(), translation);
  };
  out$.log = log = function(it){
    console.log(it);
    return it;
  };
  out$.degrees = degrees = function(it){
    return it * 180 / Math.PI;
  };
  out$.radians = radians = function(it){
    return it * Math.PI / 180;
  };
  out$.$ = $ = function(it){
    return document.getElementById(it);
  };
  out$.flatten3d = flatten3d = function(gl, pixels, width, height, depth){
    var data, tex;
    if (width * height * depth > 2048 * 2048) {
      throw new Error("That 3d texture is too big ;_;");
    }
    data = new Uint8Array(pixels);
    tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 1, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, data);
    return gl.texParameteri;
  };
  out$.readPpm = readPpm = function(gl, it){
    var ref$, p3, width, height, pixels, data, tex;
    ref$ = it.split(/\s+/), p3 = ref$[0], width = ref$[1], height = ref$[2], pixels = slice$.call(ref$, 3);
    data = new Uint8Array(pixels);
    tex = gl.createTexture();
    return gl.bindTexture(gl.TEXTURE_2D, tex);
  };
  RES = 12;
  CIRCLE = Math.PI * 2;
  RADS = CIRCLE / RES;
  function mod(n, b){
    return (n % b + b) % b;
  }
  out$.makeDonut = makeDonut = function(){
    var thetas, phis, i, j, theta, step$, to$, phi, step1$, to1$, results$ = [];
    thetas = new Float32Array(RES * RES * 2 * 3);
    phis = new Float32Array(RES * RES * 2 * 3);
    i = 0;
    j = 0;
    for (theta = 0, to$ = CIRCLE, step$ = RADS; step$ < 0 ? theta > to$ : theta < to$; theta += step$) {
      for (phi = 0, to1$ = CIRCLE, step1$ = RADS; step1$ < 0 ? phi > to1$ : phi < to1$; phi += step1$) {
        thetas[i++] = theta;
        phis[j++] = phi;
        thetas[i++] = theta;
        phis[j++] = mod(phi + RADS, CIRCLE);
        thetas[i++] = mod(theta + RADS, CIRCLE);
        phis[j++] = phi;
        thetas[i++] = theta;
        phis[j++] = mod(phi + RADS, CIRCLE);
        thetas[i++] = mod(theta - RADS, CIRLCE);
        phis[j++] = phi;
        thetas[i++] = theta;
        results$.push(phis[j++] = mod(phi + 2 * RADS, CIRCLE));
      }
    }
    return results$;
  };
  out$.sphereToCube = sphereToCube = function(gl, sphere){
    return stuff;
  };
  out$.shaderProgram = shaderProgram = function(gl, arg$){
    var vertex, fragment, init, x$, vertexShader, fragmentShader, program;
    vertex = arg$.vertex, fragment = arg$.fragment, init = arg$.init;
    x$ = vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(x$, vertex);
    gl.compileShader(x$);
    if (!gl.getShaderParameter(x$, COMPILE_STATUS)) {
      throw new Error("couldn't compile vertex shader!\n" + gl.getShaderInfoLog(x$));
    }
    x$ = fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(x$, fragment);
    gl.compileShader(x$);
    if (!gl.getShaderParameter(x$, COMPILE_STATUS)) {
      throw new Error("couldn't compile fragment shader!\n" + gl.getShaderInfoLog(x$));
    }
    x$ = program = gl.createProgram();
    gl.attachShader(x$, vertexShader);
    gl.attachShader(x$, fragmentShader);
    gl.linkProgram(x$);
    if (!gl.getProgramParameter(x$, LINK_STATUS)) {
      throw new Error("couldn't intialize shader program!");
    }
    return function(){
      gl.useProgram(program);
      init(gl, program);
    };
  };
}).call(this);
