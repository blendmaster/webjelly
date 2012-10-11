/* This file (utils.js) is compiled from utils.co. Please view the
original commented source there. */
(function(){
  "use strict";
  var log, degrees, radians, $, out$ = typeof exports != 'undefined' && exports || this;
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
}).call(this);
