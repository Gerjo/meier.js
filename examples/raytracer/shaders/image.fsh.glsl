precision highp float;


varying vec2 uvmapping;
varying vec2 uvunit;

uniform sampler2D sampler;

void main() {
    
    
    gl_FragColor = texture2D(sampler, uvmapping);//vec4(1.0, 0.0, 0.0, 1.0);
}
