#extension GL_EXT_draw_buffers : require

precision highp float;

#include "shaders/common.glsl"

uniform int readBuffer;
uniform int writeBuffer;

varying vec2 uvmapping;
varying vec2 uvunit;

// Data from previous bounce. These are sensible float textures.
uniform sampler2D samplerDirection;
uniform sampler2D samplerPosition;
uniform sampler2D samplerMeta;


void main() {
    // Retrieve from previous bounce iteration
    vec3 inDirection = texture2D(samplerDirection, uvmapping).xyz;
    vec3 inPosition  = texture2D(samplerPosition, uvmapping).xyz;
    vec2 inMeta      = texture2D(samplerMeta, uvmapping).xy;
    
    // Initialize defaults
    vec3 outDirection = vec3(1, 2, 3);
    vec3 outPosition  = vec3(1, 2, 3);
    vec2 outMeta      = vec2(1, 55);
    
    // Copy as-is, for debug:
    outDirection = inDirection;
    outPosition  = inPosition;
    outMeta      = inMeta;
    
    // mad physics skills here.
    
    // Smear components into 8, 4-byte vectors.
    gl_FragData[0] = encode_float(outDirection.x);
    gl_FragData[1] = encode_float(outDirection.y);
    gl_FragData[2] = encode_float(outDirection.z);
    gl_FragData[3] = encode_float(outPosition.x);
    gl_FragData[4] = encode_float(outPosition.y);
    gl_FragData[5] = encode_float(outPosition.z);
    gl_FragData[6] = encode_float(outMeta.x);
    gl_FragData[7] = encode_float(outMeta.y);
}
