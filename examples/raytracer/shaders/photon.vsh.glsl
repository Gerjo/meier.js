precision highp float;

attribute vec2 attribPosition;

uniform vec2 windowSize;

varying vec2 uvmapping;
varying vec2 uvunit;

void main() {
    
    // Pass on to the fragment shader
    uvmapping = (attribPosition + 1.0) / 2.0;
    uvunit    = 1.0 / windowSize;
    
    // gl_Position = vec4(0.0,0.0,0.0,1.0);
    gl_Position = vec4(attribPosition, 0.0, 1.0);
}
