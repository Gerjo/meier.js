precision highp float;

attribute vec2 position;

varying vec3 pos;
varying vec2 uv;

void main() {
    pos  = vec3(position, 0.0);
    
    uv   = (position + 1.0) / 2.0;
    
    gl_Position = vec4(position, 0.0, 1.0);
}
