/* This file (programs.js) is compiled from programs.co. Please view the
original commented source there. */
(function(){
  "use strict";
  var programs, load, out$ = typeof exports != 'undefined' && exports || this;
  programs = {};
  out$.load = load = function(it, gl){
    return programs[it](gl);
  };
  programs.flat = shaderProgram({
    vertex: "attribute vec3 coord;\nattribute vec3 normal;\n\nvarying float NdotL;\nvarying vec3 aColor;\n\nuniform mat4 ModelViewMatrix;\nuniform mat4 ProjectionMatrix;\nuniform mat3 NormalMatrix;\nuniform vec3 L;\n\nuniform float LightIntensity;\nuniform float AmbientIntensity;\nuniform vec3 DiffuseAndAmbientCoefficient;\n\nvoid main() {\n  vec4 WorldCoord = ModelViewMatrix * vec4(coord,1.0);\n  vec3 WorldNormal = NormalMatrix * normal;\n  vec3 N = normalize(WorldNormal);\n  NdotL = dot(N,L);\n\n  aColor =\n    ((LightIntensity * (NdotL > 0.0 ? NdotL : 0.0) + AmbientIntensity) *\n    DiffuseAndAmbientCoefficient);\n\n  gl_Position = ProjectionMatrix * WorldCoord;\n}",
    fragment: "precision mediump float;\n\nvarying vec3 aColor;\n\nvoid main() {\n  gl_FragColor = vec4(aColor, 1.0);\n}",
    uniforms: {
      LightIntensity: ['1f', 0.9],
      AmbientIntensity: ['1f', 0.2],
      DiffuseAndAmbientCoefficient: ['3f', 1, 1, 1],
      L: ['3fv', vec3.normalize(vec3.direction([0, 0, -1], [-10, -10, 10]))]
    }
  });
  programs.gouraud = shaderProgram({
    vertex: "precision mediump float;\n\nattribute vec3 coord;\nattribute vec3 normal;\n\nvarying vec3 aColor;\n\nuniform mat4 ModelViewMatrix;\nuniform mat4 ProjectionMatrix;\nuniform mat3 NormalMatrix;\nuniform vec3 LightLocation;\n\nuniform float LightIntensity;\nuniform float AmbientIntensity;\nuniform vec3 DiffuseAndAmbientCoefficient;\n\nvoid main() {\n  vec4 WorldCoord = ModelViewMatrix * vec4(coord,1.0);\n  vec3 L = normalize(LightLocation - WorldCoord.xyz);\n  vec3 WorldNormal = NormalMatrix * normal;\n  vec3 N = normalize(WorldNormal);\n  float NdotL = dot(N,L);\n  aColor =\n    ((LightIntensity * (NdotL > 0.0 ? NdotL : 0.0) + AmbientIntensity) *\n    DiffuseAndAmbientCoefficient);\n\n  gl_Position = ProjectionMatrix * WorldCoord;\n}",
    fragment: "precision mediump float;\n\nvarying vec3 aColor;\n\nvoid main() {\n  gl_FragColor = vec4(aColor, 1.0);\n}",
    uniforms: {
      LightIntensity: ['1f', 0.8],
      AmbientIntensity: ['1f', 0.2],
      DiffuseAndAmbientCoefficient: ['3f', 1, 1, 1],
      LightLocation: ['3f', -10, -10, 10]
    }
  });
  programs.donut = shaderProgram({
    vertex: "#define TWOPI " + 2 * Math.PI + "\nprecision mediump float;\n\nattribute float theta;\nattribute float phi;\n\nvarying vec2 tex;\nvarying float intensity;\n\nuniform mat4 ModelViewMatrix;\nuniform mat4 ProjectionMatrix;\nuniform mat3 NormalMatrix;\nuniform vec3 LightLocation;\n\nuniform float LightIntensity;\nuniform float AmbientIntensity;\n\nvoid main() {\n  vec3 coord = vec3( (0.75 + 0.25 * cos(phi)) * cos(theta)\n                   , (0.75 + 0.25 * cos(phi)) * sin(theta)\n                   , 0.25 * sin(phi)\n                   );\n  vec3 normal = vec3( cos(phi) * cos(theta)\n                    , cos(phi) * sin(theta)\n                    , sin(phi)\n                    );\n  tex = vec2(theta/TWOPI,phi/TWOPI);\n\n  vec4 WorldCoord = ModelViewMatrix * vec4(coord,1.0);\n  vec3 L = normalize(LightLocation - WorldCoord.xyz);\n  vec3 WorldNormal = NormalMatrix * normal;\n  vec3 N = normalize(WorldNormal);\n  float NdotL = dot(N,L);\n  intensity =\n    (LightIntensity * (NdotL > 0.0 ? NdotL : 0.0) + AmbientIntensity);\n\n  gl_Position = ProjectionMatrix * WorldCoord;\n}",
    fragment: "precision mediump float;\n\nuniform sampler2D texture;\n\nvarying vec2 tex; // coords\nvarying float intensity;\n\nvoid main() {\n  gl_FragColor = vec4(intensity * texture2D(texture, tex).xyz, 1.0);\n}",
    uniforms: {
      LightIntensity: ['1f', 0.8],
      AmbientIntensity: ['1f', 0.2],
      LightLocation: ['3f', -10, -10, 10]
    }
  });
  programs.environment = shaderProgram({
    vertex: "precision mediump float;\n\nattribute vec3 coord;\nattribute vec3 normal;\n\nvarying vec2 tex;\n//varying float intensity;\n\nuniform mat4 ModelViewMatrix;\nuniform mat4 ProjectionMatrix;\nuniform mat3 NormalMatrix;\nuniform vec3 LightLocation;\n\n//uniform float LightIntensity;\n//uniform float AmbientIntensity;\n\nvoid main() {\n  vec4 WorldCoord = ModelViewMatrix * vec4(coord,1.0);\n  vec3 L = normalize(LightLocation - WorldCoord.xyz);\n  vec3 WorldNormal = NormalMatrix * normal;\n  vec3 N = normalize(WorldNormal);\n  //float NdotL = dot(N,L);\n  //intensity =\n  //  (LightIntensity * (NdotL > 0.0 ? NdotL : 0.0) + AmbientIntensity);\n\n  tex = vec2( (1.0 + N.x) / 2.0\n            , (1.0 + N.y) / 2.0\n            );\n\n  gl_Position = ProjectionMatrix * WorldCoord;\n}",
    fragment: "precision mediump float;\n\nuniform sampler2D texture;\n\nvarying vec2 tex; // coords\n//varying float intensity;\n\nvoid main() {\n  //gl_FragColor = vec4(intensity * texture2D(texture, tex).xyz, 1.0);\n  gl_FragColor = vec4(texture2D(texture, tex).xyz, 1.0);\n}"
  });
  programs.threedee = shaderProgram({
    vertex: "precision mediump float;\n\nattribute vec3 coord;\nattribute vec3 normal;\n\nvarying vec3 box; // coords [0-1] in all axes\nvarying float intensity;\n\nuniform mat4 ModelViewMatrix;\nuniform mat4 ProjectionMatrix;\nuniform mat3 NormalMatrix;\nuniform vec3 LightLocation;\nuniform mat4 TextureSpaceMatrix;\n\nuniform float LightIntensity;\nuniform float AmbientIntensity;\n\nvoid main() {\n  vec4 WorldCoord = ModelViewMatrix * vec4(coord,1.0);\n  vec3 L = normalize(LightLocation - WorldCoord.xyz);\n  vec3 WorldNormal = NormalMatrix * normal;\n  vec3 N = normalize(WorldNormal);\n  float NdotL = dot(N,L);\n  intensity =\n    (LightIntensity * (NdotL > 0.0 ? NdotL : 0.0) + AmbientIntensity);\n\n  box = vec3(TextureSpaceMatrix * vec4(coord, 1.0));\n\n  gl_Position = ProjectionMatrix * WorldCoord;\n}",
    fragment: "precision mediump float;\n\nvarying float intensity;\nvarying vec3 box; // 0 - 1 in all axes\n\n// actually 3D, so need special indexing\n// 2048 x 1024\nuniform sampler2D texture;\n\nvoid main() {\n  // indistinguishable from magic\n  vec2 idx = vec2( (floor((floor(box.y * 8.0) - box.y * 8.0) * 16.0) * 128.0 + 128.0 * box.z) / 2048.0\n                 , (floor(128.0 * box.x) * 8.0 + box.y * 8.0) / 1024.0\n                 );\n  gl_FragColor = vec4(intensity * texture2D(texture, idx).xyz, 1.0);\n}",
    uniforms: {
      LightIntensity: ['1f', 0.8],
      AmbientIntensity: ['1f', 0.2],
      LightLocation: ['3f', -10, -10, 10]
    }
  });
}).call(this);
