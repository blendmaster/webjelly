/* This file (utils.js) is compiled from utils.co. Please view the
original commented source there. */
(function(){
  "use strict";
  Object.defineProperty(Matrix.prototype, 'floats', {
    get: function(){
      return new Float32Array(this.flatten());
    },
    configurable: true,
    enumerable: true
  });
}).call(this);
