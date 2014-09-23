precision highp float;

varying vec3 pos;
varying vec2 uv;

uniform sampler2D samplerColor;
uniform sampler2D samplerPosition;
uniform sampler2D samplerNormal;
uniform sampler2D samplerDepth;

uniform mat4 projection;
uniform mat4 view;

uniform vec3 lights[1];


void main() {
    
    vec3 light = lights[0];
    
    
    vec3 normal   = texture2D(samplerNormal, uv).xyz;
    vec3 p = texture2D(samplerPosition, uv).xyz;
    
    vec3 dir = normalize(light - p);
    
    float lambertian = max(dot(dir, normal), 0.0);
    float specular   = 0.0;
    
    if(lambertian > 0.0) {
        vec3 viewDir = normalize(-p);

        // Blinn-Phong
        vec3 halfDir = normalize(dir + viewDir);
        float specAngle = max(dot(halfDir, normal), 0.0);
        specular = pow(specAngle, 16.0);
    }
    
    vec3 color = vec3(1.0, 1.0, 1.0) * lambertian + vec3(1.0, 1.0, 1.0) * specular;
    
    vec4 textureColor = texture2D(samplerColor, uv);
    
    gl_FragColor = vec4(color, textureColor.a);
}
