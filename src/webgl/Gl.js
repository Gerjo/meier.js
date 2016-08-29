define(function(require) {
    var canvas = document.createElement("canvas");
    var gl     = canvas.getContext("experimental-webgl") || canvas.getContext('webgl');
    
    return gl;
});