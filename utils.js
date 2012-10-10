/* This file (utils.js) is compiled from utils.co. Please view the
original commented source there. */
(function(){
  "use strict";
  mat4.translation = function(x, y, z){
    return mat4.translate(mat4.identity(), [x, y, z]);
  };
}).call(this);
