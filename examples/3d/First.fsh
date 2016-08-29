#extension GL_EXT_draw_buffers : require

precision highp float;


uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;

uniform vec3 camera;


varying vec3 pos;
varying vec3 norm;


void main() {
    //vec3 dir = normalize(lights[0] - pos);
    
    //float lambertian = max(dot(dir, norm), 0.0);
    //float specular   = 0.0;
    
    /*if(lambertian > 0.0) {
        vec3 viewDir = normalize(pos);

        // Blinn-Phong
        vec3 halfDir = normalize(dir + viewDir);
        //float specAngle = max(dot(halfDir, norm), 0.0);
        float specAngle = max(dot(halfDir, norm), 0.0);
        specular = pow(specAngle, 16.0);
    }*/
    
    
    //vec3 color = vec3(1.5, 0.5, 0.5) * lambertian + vec3(1.5, 1.5, 1.5) * specular;
    
    float depth = length(pos + camera);
    
    gl_FragData[0] = vec4(0.5, 0.5, 0.5, 1.0);//vec4(color, 1.0); // color
    gl_FragData[1] = vec4(pos, 1.0); // position
    gl_FragData[2] = vec4(norm, 1.0); // normal
    gl_FragData[3] = vec4(depth, depth, depth, depth); // depth
}
